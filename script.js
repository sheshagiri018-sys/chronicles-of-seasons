// =====================================================
// CHRONICLES OF SEASONS
// Main Script
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const moodScreen = document.getElementById("mood-screen");
    const moodButtons = document.querySelectorAll(".mood-btn");
    const moodSkip = document.getElementById("mood-skip");

    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loader-bar");
    const loaderPercent = document.getElementById("loader-percent");

    const progressBar = document.getElementById("life-progress-bar");
    const trackerPct = document.getElementById("tracker-pct");
    const tracker = document.getElementById("life-tracker");

    const compassDots = document.querySelectorAll(".compass-dot");

    const weatherName = document.getElementById("wi-name");

    const soundBtn = document.getElementById("sound-btn");
    const audio = document.getElementById("audio-summer");

    const cosmosBtn = document.getElementById("cosmos-unlock");
    const cosmosSection = document.getElementById("cosmos");
    const cosmosDot = document.querySelector(".cosmos-dot");

    const beginAgain = document.getElementById("begin-again");

    const easterOverlay = document.getElementById("easter-egg-overlay");
    const easterClose = document.getElementById("ee-close");
    const easterText = document.getElementById("ee-quote-text");

    const cursor = document.getElementById("cursor");
    const trail = document.getElementById("cursor-trail");

    // =====================================================
    // CUSTOM CURSOR
    // =====================================================

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";

        setTimeout(() => {
            trail.style.left = mouseX + "px";
            trail.style.top = mouseY + "px";
        }, 40);

    });

    // =====================================================
    // MOOD SELECTOR
    // =====================================================

    function startJourney() {

        moodScreen.classList.add("fade-out");

        setTimeout(() => {
            moodScreen.classList.add("gone");
            runLoader();
        }, 1000);

    }

    moodButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            moodButtons.forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");

            const mood = btn.dataset.mood;

            document.body.classList.add(`mood-${mood}`);

            setTimeout(startJourney, 500);

        });

    });

    moodSkip.addEventListener("click", startJourney);

    // =====================================================
    // LOADER
    // =====================================================

    function runLoader() {

        let value = 0;

        const interval = setInterval(() => {

            value++;

            loaderBar.style.width = value + "%";
            loaderPercent.textContent = value + "%";

            if (value >= 100) {

                clearInterval(interval);

                setTimeout(() => {

                    loader.classList.add("hidden");

                    tracker.classList.add("visible");

                    document
                        .querySelector("#summer")
                        .classList.add("active");

                }, 500);
            }

        }, 25);

    }

    // =====================================================
    // SECTION ACTIVATION
    // =====================================================

    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    sections.forEach(s => s.classList.remove("active"));

                    entry.target.classList.add("active");

                    updateSeason(entry.target.id);

                }

            });

        },

        {
            threshold: 0.4
        }

    );

    sections.forEach(section => observer.observe(section));

    // =====================================================
    // WEATHER LABEL
    // =====================================================

    function updateSeason(id) {

        weatherName.textContent =
            id.charAt(0).toUpperCase() + id.slice(1);

        document.body.classList.remove(
            "season-summer",
            "season-rain",
            "season-autumn",
            "season-winter",
            "season-spring",
            "season-cosmos"
        );

        document.body.classList.add(`season-${id}`);

    }

    // =====================================================
    // COMPASS NAVIGATION
    // =====================================================

    compassDots.forEach(dot => {

        dot.addEventListener("click", () => {

            const target = dot.dataset.section;

            const section = document.getElementById(target);

            if (!section) return;

            section.scrollIntoView({
                behavior: "smooth"
            });

        });

    });

    // =====================================================
    // ACTIVE COMPASS STATE
    // =====================================================

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 300;

            if (scrollY >= top) {
                current = section.id;
            }

        });

        compassDots.forEach(dot => {

            dot.classList.remove("active");

            if (dot.dataset.section === current) {
                dot.classList.add("active");
            }

        });

    });

    // =====================================================
    // SCROLL PROGRESS
    // =====================================================

    window.addEventListener("scroll", () => {

        const scrollTop = window.scrollY;

        const height =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress = (scrollTop / height) * 100;

        progressBar.style.width = progress + "%";

        trackerPct.textContent =
            Math.floor(progress) + "%";

    });

    // =====================================================
    // SOUND TOGGLE
    // =====================================================

    let soundEnabled = false;

    soundBtn.addEventListener("click", () => {

        soundEnabled = !soundEnabled;

        if (soundEnabled) {

            audio.volume = 0.3;

            audio.play().catch(() => {});

            soundBtn.style.opacity = "1";

        } else {

            audio.pause();

            soundBtn.style.opacity = "0.5";

        }

    });

    // =====================================================
    // COSMOS UNLOCK
    // =====================================================

    cosmosBtn?.addEventListener("click", () => {

        cosmosSection.classList.remove("hidden");

        cosmosDot.classList.remove("hidden");

        cosmosSection.scrollIntoView({
            behavior: "smooth"
        });

    });

    // =====================================================
    // BEGIN AGAIN
    // =====================================================

    beginAgain?.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    // =====================================================
    // EASTER EGG
    // =====================================================

    const hiddenQuotes = [

        "The stars are reminders that darkness can still shine.",

        "Every ending is simply a hidden beginning.",

        "Growth happens in seasons you never expected.",

        "The universe bends toward possibility."

    ];

    let clickCount = 0;

    document.addEventListener("keydown", e => {

        if (e.key.toLowerCase() === "c") {

            clickCount++;

            if (clickCount >= 5) {

                clickCount = 0;

                easterText.textContent =
                    hiddenQuotes[
                        Math.floor(
                            Math.random() *
                            hiddenQuotes.length
                        )
                    ];

                easterOverlay.classList.remove("hidden");

                easterOverlay.classList.add("visible");

            }

        }

    });

    easterClose?.addEventListener("click", () => {

        easterOverlay.classList.remove("visible");

        setTimeout(() => {

            easterOverlay.classList.add("hidden");

        }, 500);

    });

});