/* =========================================================
   APPWRITE CONFIGURATION
   ========================================================= */

const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "6ac5a6a70015601de61a";

/* =========================================================
   APPWRITE INITIALIZATION
   ========================================================= */

const { Client, Account, ID } = Appwrite;

const client = new Client();

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);

/* =========================================================
   APPLICATION STATE
   ========================================================= */

let mode = "login";

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   MESSAGE HANDLING
   ========================================================= */

function showMessage(text, type = "error") {
    const message = $("message");

    if (!message) return;

    message.textContent = text;
    message.className = `message show ${type}`;
}

function clearMessage() {
    const message = $("message");

    if (!message) return;

    message.textContent = "";
    message.className = "message";
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoading(loading) {
    const button = $("submitButton");

    if (!button) return;

    button.disabled = loading;
    button.classList.toggle("loading", loading);

    const text = $("submitText");

    if (text) {
        if (loading) {
            text.textContent =
                mode === "signup"
                    ? "Creating account..."
                    : "Signing in...";
        } else {
            text.textContent =
                mode === "signup"
                    ? "Create account"
                    : "Log in";
        }
    }
}

/* =========================================================
   APPWRITE ERROR HANDLING
   ========================================================= */

function friendlyError(error) {

    console.error("Appwrite error:", error);

    /*
     * Browser/network error.
     *
     * This usually means:
     * - incorrect Appwrite endpoint
     * - Appwrite Web platform not configured
     * - CORS issue
     * - network problem
     */

    if (
        error instanceof TypeError &&
        error.message &&
        error.message.toLowerCase().includes("fetch")
    ) {
        return `
Unable to connect to Appwrite.

Check that your Render domain is added to:
Appwrite → Project → Platforms → Web

Use only your Render hostname, for example:
your-app.onrender.com
        `.trim();
    }

    const code = error?.code;

    if (code === 400) {
        return error.message || "Please check the information you entered.";
    }

    if (code === 401) {
        return "The email or password is incorrect.";
    }

    if (code === 403) {
        return "This request was blocked. Check your Appwrite project and Web platform settings.";
    }

    if (code === 404) {
        return "Appwrite project or endpoint could not be found.";
    }

    if (code === 409) {
        return "An account with this email already exists.";
    }

    if (code === 429) {
        return "Too many attempts. Please wait a moment and try again.";
    }

    if (error?.message) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

/* =========================================================
   SWITCH LOGIN / SIGNUP
   ========================================================= */

function setMode(nextMode) {

    mode = nextMode;

    const signup = mode === "signup";

    if ($("loginTab")) {
        $("loginTab").classList.toggle("active", !signup);
        $("loginTab").setAttribute(
            "aria-selected",
            String(!signup)
        );
    }

    if ($("signupTab")) {
        $("signupTab").classList.toggle("active", signup);
        $("signupTab").setAttribute(
            "aria-selected",
            String(signup)
        );
    }

    if ($("nameField")) {
        $("nameField").hidden = !signup;
    }

    if ($("confirmField")) {
        $("confirmField").hidden = !signup;
    }

    if ($("loginOptions")) {
        $("loginOptions").hidden = signup;
    }

    if ($("formTitle")) {
        $("formTitle").textContent =
            signup
                ? "Create your account"
                : "Welcome back";
    }

    if ($("formSubtitle")) {
        $("formSubtitle").textContent =
            signup
                ? "Create a secure account in a few seconds."
                : "Sign in to continue to your account.";
    }

    if ($("submitText")) {
        $("submitText").textContent =
            signup
                ? "Create account"
                : "Log in";
    }

    if ($("password")) {
        $("password").setAttribute(
            "autocomplete",
            signup
                ? "new-password"
                : "current-password"
        );
    }

    clearMessage();
}

/* =========================================================
   SIGN UP
   ========================================================= */

async function signUp(name, email, password) {

    console.log("Creating Appwrite account...");

    /*
     * Create user account
     */

    await account.create({
        userId: ID.unique(),
        email: email,
        password: password,
        name: name
    });

    console.log("Account created successfully.");

    /*
     * Create login session immediately
     */

    await account.createEmailPasswordSession({
        email: email,
        password: password
    });

    console.log("Session created successfully.");
}

/* =========================================================
   LOGIN
   ========================================================= */

async function login(email, password) {

    console.log("Creating Appwrite login session...");

    await account.createEmailPasswordSession({
        email: email,
        password: password
    });

    console.log("Login successful.");
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    await account.deleteSession({
        sessionId: "current"
    });
}

/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function getCurrentUser() {

    return await account.get();
}

/* =========================================================
   RENDER LOGGED-IN ACCOUNT
   ========================================================= */

function renderAccount(user) {

    if ($("authForm")) {
        $("authForm").hidden = true;
    }

    if ($("loggedIn")) {
        $("loggedIn").hidden = false;
    }

    if ($("loginTab")) {
        $("loginTab").disabled = true;
    }

    if ($("signupTab")) {
        $("signupTab").disabled = true;
    }

    if ($("formTitle")) {
        $("formTitle").textContent = "Your account";
    }

    if ($("formSubtitle")) {
        $("formSubtitle").textContent =
            "You are securely authenticated with Appwrite.";
    }

    if ($("accountInfo")) {
        $("accountInfo").textContent =
            `${user.name || "User"} · ${user.email}`;
    }

    if ($("avatar")) {

        const value =
            user.name ||
            user.email ||
            "U";

        $("avatar").textContent =
            value.trim().charAt(0).toUpperCase();
    }

    clearMessage();
}

/* =========================================================
   RENDER LOGGED-OUT STATE
   ========================================================= */

function renderLoggedOut() {

    if ($("authForm")) {
        $("authForm").hidden = false;
    }

    if ($("loggedIn")) {
        $("loggedIn").hidden = true;
    }

    if ($("loginTab")) {
        $("loginTab").disabled = false;
    }

    if ($("signupTab")) {
        $("signupTab").disabled = false;
    }

    setMode(mode);
}

/* =========================================================
   LOGIN TAB
   ========================================================= */

if ($("loginTab")) {

    $("loginTab").addEventListener(
        "click",
        () => {
            setMode("login");
        }
    );
}

/* =========================================================
   SIGNUP TAB
   ========================================================= */

if ($("signupTab")) {

    $("signupTab").addEventListener(
        "click",
        () => {
            setMode("signup");
        }
    );
}

/* =========================================================
   SHOW / HIDE PASSWORD
   ========================================================= */

if ($("togglePassword")) {

    $("togglePassword").addEventListener(
        "click",
        () => {

            const input = $("password");

            if (!input) return;

            const visible =
                input.type === "text";

            input.type =
                visible
                    ? "password"
                    : "text";

            $("togglePassword").textContent =
                visible
                    ? "Show"
                    : "Hide";
        }
    );
}

/* =========================================================
   AUTH FORM SUBMISSION
   ========================================================= */

if ($("authForm")) {

    $("authForm").addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearMessage();

            const name =
                $("name")?.value.trim() || "";

            const email =
                $("email")?.value.trim() || "";

            const password =
                $("password")?.value || "";

            const confirmPassword =
                $("confirmPassword")?.value || "";

            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (!email) {
                showMessage(
                    "Please enter your email address."
                );
                return;
            }

            if (!password) {
                showMessage(
                    "Please enter your password."
                );
                return;
            }

            if (password.length < 8) {
                showMessage(
                    "Your password must be at least 8 characters."
                );
                return;
            }

            if (mode === "signup") {

                if (!name) {
                    showMessage(
                        "Please enter your full name."
                    );
                    return;
                }

                if (password !== confirmPassword) {
                    showMessage(
                        "The passwords do not match."
                    );
                    return;
                }
            }

            /* -----------------------------------------
               START REQUEST
            ----------------------------------------- */

            setLoading(true);

            try {

                if (mode === "signup") {

                    await signUp(
                        name,
                        email,
                        password
                    );

                } else {

                    await login(
                        email,
                        password
                    );
                }

                /* -------------------------------------
                   GET AUTHENTICATED USER
                ------------------------------------- */

                const user =
                    await getCurrentUser();

                console.log(
                    "Authenticated user:",
                    user
                );

               renderAccount(user);

showMessage(
    mode === "signup"
        ? "Your account has been created successfully."
        : "Login successful.",
    "success"
);
               window.location.href = "dashboard.html";



            } catch (error) {

                showMessage(
                    friendlyError(error)
                );

            } finally {

                setLoading(false);
            }
        }
    );
}

/* =========================================================
   LOGOUT BUTTON
   ========================================================= */

if ($("logoutButton")) {

    $("logoutButton").addEventListener(
        "click",
        async () => {

            try {

                await logout();

                renderLoggedOut();

                showMessage(
                    "You have been logged out.",
                    "success"
                );

            } catch (error) {

                showMessage(
                    friendlyError(error)
                );
            }
        }
    );
}

/* =========================================================
   CHECK EXISTING SESSION
   ========================================================= */

async function checkExistingSession() {

    try {

        console.log(
            "Checking Appwrite authentication session..."
        );

        const user = await getCurrentUser();

        console.log(
            "Existing session found:",
            user
        );

        // Already authenticated → dashboard
        window.location.href = "dashboard.html";

    } catch (error) {

        // No active session is normal.
        console.log(
            "No active Appwrite session."
        );

        renderLoggedOut();
    }
}


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Appwrite authentication initialized."
        );

        console.log(
            "Endpoint:",
            APPWRITE_ENDPOINT
        );

        console.log(
            "Project ID:",
            APPWRITE_PROJECT_ID
        );

        setMode("login");

        checkExistingSession();
    }
);
