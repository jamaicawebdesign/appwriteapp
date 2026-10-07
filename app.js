/* Appwrite configuration */
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID';

const { Client, Account, ID } = Appwrite;
const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
const account = new Account(client);

const $ = (id) => document.getElementById(id);
let mode = 'login';

function showMessage(text, type='error') {
  const el = $('message');
  el.textContent = text;
  el.className = `message show ${type}`;
}
function clearMessage(){ $('message').className='message'; $('message').textContent=''; }
function setLoading(loading){ $('submitButton').disabled=loading; $('submitButton').classList.toggle('loading',loading); }
function friendlyError(error){
  const code = error?.code;
  if(code === 401) return 'The email or password is incorrect.';
  if(code === 409) return 'An account with this email already exists.';
  if(code === 400) return error.message || 'Please check the information you entered.';
  if(code === 429) return 'Too many attempts. Please wait a moment and try again.';
  return error?.message || 'Something went wrong. Please try again.';
}

function setMode(next){
  mode = next;
  const signup = mode === 'signup';
  $('loginTab').classList.toggle('active', !signup);
  $('signupTab').classList.toggle('active', signup);
  $('loginTab').setAttribute('aria-selected', String(!signup));
  $('signupTab').setAttribute('aria-selected', String(signup));
  $('nameField').hidden = !signup;
  $('confirmField').hidden = !signup;
  $('loginOptions').hidden = signup;
  $('formTitle').textContent = signup ? 'Create your account' : 'Welcome back';
  $('formSubtitle').textContent = signup ? 'Create a secure account in a few seconds.' : 'Sign in to continue to your account.';
  $('submitText').textContent = signup ? 'Create account' : 'Log in';
  $('password').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
  clearMessage();
}

async function signUp(name,email,password){
  await account.create({ userId: ID.unique(), email, password, name });
  await account.createEmailPasswordSession({ email, password });
}
async function login(email,password){
  await account.createEmailPasswordSession({ email, password });
}
async function logout(){ await account.deleteSession({ sessionId:'current' }); }

function renderAccount(user){
  $('authForm').hidden = true;
  $('loggedIn').hidden = false;
  $('loginTab').disabled = true;
  $('signupTab').disabled = true;
  $('formTitle').textContent = 'Your account';
  $('formSubtitle').textContent = 'You are securely authenticated with Appwrite.';
  $('accountInfo').textContent = `${user.name || 'User'} · ${user.email}`;
  $('avatar').textContent = (user.name || user.email || 'U').trim().charAt(0).toUpperCase();
  clearMessage();
}
function renderLoggedOut(){
  $('authForm').hidden = false;
  $('loggedIn').hidden = true;
  $('loginTab').disabled = false;
  $('signupTab').disabled = false;
  setMode(mode);
}

$('loginTab').addEventListener('click',()=>setMode('login'));
$('signupTab').addEventListener('click',()=>setMode('signup'));
$('togglePassword').addEventListener('click',()=>{
  const input=$('password');
  const visible=input.type==='text';
  input.type=visible?'password':'text';
  $('togglePassword').textContent=visible?'Show':'Hide';
});
$('authForm').addEventListener('submit', async (event)=>{
  event.preventDefault(); clearMessage();
  const name=$('name').value.trim();
  const email=$('email').value.trim();
  const password=$('password').value;
  const confirm=$('confirmPassword').value;
  if(!email || !password){ showMessage('Enter your email and password.'); return; }
  if(password.length < 8){ showMessage('Your password must be at least 8 characters.'); return; }
  if(mode==='signup' && !name){ showMessage('Enter your full name.'); return; }
  if(mode==='signup' && password !== confirm){ showMessage('The passwords do not match.'); return; }
  setLoading(true);
  try{
    if(APPWRITE_PROJECT_ID === 'YOUR_PROJECT_ID') throw new Error('Add your Appwrite Project ID in app.js before using authentication.');
    if(mode==='signup') await signUp(name,email,password); else await login(email,password);
    const user=await account.get();
    renderAccount(user);
  }catch(error){ showMessage(friendlyError(error)); }
  finally{ setLoading(false); }
});
$('logoutButton').addEventListener('click', async()=>{
  try{ await logout(); renderLoggedOut(); showMessage('You have been logged out.','success'); }
  catch(error){ showMessage(friendlyError(error)); }
});

(async()=>{
  if(APPWRITE_PROJECT_ID === 'YOUR_PROJECT_ID') return;
  try{ const user=await account.get(); renderAccount(user); } catch(_) { renderLoggedOut(); }
})();
