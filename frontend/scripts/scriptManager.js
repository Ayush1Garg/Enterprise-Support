const sectionOneToggler = document.getElementById('sectionOneToggler');
const sectionTwoToggler = document.getElementById('sectionTwoToggler');
const sectionThreeToggler = document.getElementById('sectionThreeToggler');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const emptyBody = document.getElementById('emptyBody')

let currentSection = "";
let loggedIn = false;
loginBtn.addEventListener('click', async () => {
    const status = await authenticate();
    if (status == "success") {
        loggedIn = true;
        logoutBtn.classList.remove('removed');
        logoutBtn.addEventListener('click', () => {
            window.location.reload();
        })
        loginBtn.remove();
    }
})


sectionOneToggler.addEventListener("click", () => {
    document.getElementById('tableViewer').classList.add("removed");
    document.getElementById('documentGenerator').classList.remove("removed");
    document.getElementById('estimateCalculator').classList.add("removed");
    emptyBody.remove();
    sectionTwoToggler.classList.remove("active");
    sectionThreeToggler.classList.remove("active");
    sectionOneToggler.classList.add("active");
    currentSection = "documentGenerator";
})
sectionTwoToggler.addEventListener("click", async () => {
    let status = await authenticate();
    if (status == "success") {
        document.getElementById('documentGenerator').classList.add("removed");
        document.getElementById('tableViewer').classList.add("removed");
        document.getElementById('estimateCalculator').classList.remove("removed");
        emptyBody.remove();
        sectionOneToggler.classList.remove("active");
        sectionThreeToggler.classList.remove("active");
        sectionTwoToggler.classList.add("active");
        // resetEstimator();
        currentSection = "estimateCalculator";
    } else {
        alert("Authentication failed");
    }
})
sectionThreeToggler.addEventListener("click", async () => {
    let status = await authenticate();
    if (status == "success") {
        document.getElementById('documentGenerator').classList.add("removed");
        document.getElementById('estimateCalculator').classList.add("removed");
        document.getElementById('tableViewer').classList.remove("removed");
        emptyBody.remove();
        sectionOneToggler.classList.remove("active");
        sectionThreeToggler.classList.add("active");
        sectionTwoToggler.classList.remove("active");
        // resetEstimator();
        currentSection = "tableViewer"
    } else {
        alert("Authentication failed");
    }
    // alert("In Progress");
})

const authenticate = async () => {
    if (loggedIn) {
        return "success"
    }
    let status = "failed";
    let user_name = prompt("Enter User Name");
    if (!user_name) {
        status = "aborted";
        return;
    }
    let passkey = prompt("Enter Password");
    if (!passkey) {
        status = "aborted";
        return;
    };
    try {
        if (!user_name || !passkey) return;
        let response = await fetch(`/login?user_name=${user_name}&passkey=${passkey}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        let fetchedDetails = await response.json();
        if (fetchedDetails.length > 0) {
            status = "success";
            loggedIn = true;
            loginBtn.dispatchEvent(new Event('click'));
        }
    } catch (err) {
        console.error(err);
    }
    return status;
}