const sectionOneToggler = document.getElementById('sectionOneToggler');
const sectionTwoToggler = document.getElementById('sectionTwoToggler');
const sectionThreeToggler = document.getElementById('sectionThreeToggler');
const sectionFourToggler = document.getElementById('sectionFourToggler');
const sectionOne = document.getElementById('documentGenerator');
const sectionTwo = document.getElementById('estimateCalculator');
const sectionThree = document.getElementById('tableViewer');
const sectionFour = document.getElementById('modelAgreementGenerator');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const emptyBody = document.getElementById('emptyBody')

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
    sectionOne.classList.remove("removed");
    sectionTwo.classList.add("removed");
    sectionThree.classList.add("removed");
    sectionFour.classList.add("removed");
    emptyBody.remove();
    sectionOneToggler.classList.add("active");
    sectionTwoToggler.classList.remove("active");
    sectionThreeToggler.classList.remove("active");
    sectionFourToggler.classList.remove("active");
})
sectionTwoToggler.addEventListener("click", async () => {
    let status = await authenticate();
    if (status == "success") {
        sectionOne.classList.add("removed");
        sectionTwo.classList.remove("removed");
        sectionThree.classList.add("removed");
        sectionFour.classList.add("removed");
        emptyBody.remove();
        sectionOneToggler.classList.remove("active");
        sectionTwoToggler.classList.add("active");
        sectionThreeToggler.classList.remove("active");
        sectionFourToggler.classList.remove("active");
    }
})
sectionThreeToggler.addEventListener("click", async () => {
    let status = await authenticate();
    if (status == "success") {
        sectionOne.classList.add("removed");
        sectionTwo.classList.add("removed");
        sectionThree.classList.remove("removed");
        sectionFour.classList.add("removed");
        emptyBody.remove();
        sectionOneToggler.classList.remove("active");
        sectionTwoToggler.classList.remove("active");
        sectionThreeToggler.classList.add("active");
        sectionFourToggler.classList.remove("active");
    }
})
sectionFourToggler.addEventListener('click', async () => {
    sectionOne.classList.add("removed");
    sectionTwo.classList.add("removed");
    sectionThree.classList.add("removed");
    sectionFour.classList.remove("removed");
    emptyBody.remove();
    sectionOneToggler.classList.remove("active");
    sectionTwoToggler.classList.remove("active");
    sectionThreeToggler.classList.remove("active");
    sectionFourToggler.classList.add("active");
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
        let response = await fetch(`${CONFIG.BACKEND_URL}/login?user_name=${user_name}&passkey=${passkey}`, {
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
    if (status != "success") {
        alert("Authentication Failed");
    }
    return status;
}