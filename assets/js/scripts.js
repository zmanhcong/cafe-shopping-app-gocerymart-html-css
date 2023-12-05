const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Load template function
 *
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event("template-loaded"));
        });
}

/**
 * Function to check if an element is hidden by "display: none"
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === "none") {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === "none") {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * A function forces an action to wait a certain amount of time before being executed
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Function to calculate arrow position for dropdown
 *
 * How to use:
 * 1. Add class "js-dropdown-list" to level 1 ul tag
 * 2. CSS "left" for arrow via variable "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($(".js-dropdown-list"))) return;

    const items = $$(".js-dropdown-list > li");

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
    });
});

// Recalculate the arrow position when resizing the browser
window.addEventListener("resize", calArrowPos);

// Recalculate the arrow position after loading the template
window.addEventListener("template-loaded", calArrowPos);

/*
 *
 Create a settings button that allows  to switch between dark and light themes
 *
 */

document.addEventListener("DOMContentLoaded", (event) => {
    const lightThemeBtn = document.getElementById("light-mode-button");
    const darkThemeBtn = document.getElementById("dark-mode-button");

    lightThemeBtn.addEventListener("click", () => {
        document.documentElement.classList.remove("dark");
        darkThemeBtn.classList.remove("hide");
        lightThemeBtn.classList.add("hide");
    });

    darkThemeBtn.addEventListener("click", () => {
        document.documentElement.classList.add("dark");
        lightThemeBtn.classList.remove("hide");
        darkThemeBtn.classList.add("hide");
    });
});

/**
 * Keep menu active when hovering
 *
 * How it work:
 * 1. Add class "js-menu-list" to the main menu ul tag
 * 2. Add class "js-dropdown" to the current "dropdown" class if you want to reset active items when hiding the menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$(".js-dropdown");
    const menus = $$(".js-menu-list");
    const activeClass = "menu-column__list-item--active";

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            // Add class "activeClass" to first item as default.
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            // Add class "activeClass" to items when hover.
            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                    item.scrollIntoView();
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

/**
 * JS toggle (when click )drawer menu on tablet and mobile
 *
 * How to use:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
    $$(".js-toggle").forEach((button) => {
        const target = button.getAttribute("toggle-target");
        if (!target) {
            document.body.innerText = `You need add "toggle-target" for : ${button.outerHTML}`;
        }
        button.onclick = () => {
            if (!$(target)) {
                return (document.body.innerText = `Cannot found attribute as "${target}"`);
            }
            const isHidden = $(target).classList.contains("hide");

            requestAnimationFrame(() => {
                $(target).classList.toggle("hide", !isHidden);
                $(target).classList.toggle("show", isHidden);
            });
        };
    });
}

// Toggle the visibility of the ".dropdown" adjacent(sibling element) to the clicked .navbar__link
window.addEventListener("template-loaded", () => {
    // Get all ".navbar__link" class
    const navbar_links = $$(".js-dropdown-list > li > a");

    navbar_links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest("li");
            item.classList.toggle("navbar__item--active");
        };
    });
});

// JavaScript slideshow that cycles through images every 3 seconds
document.addEventListener("DOMContentLoaded", function () {
    const slideshowInner = document.querySelector(".slideshow__inner");
    const slides = document.querySelectorAll(".slideshow__inner-img");
    const firstSlideClone = slides[0].cloneNode(true); // Clone one image
    slideshowInner.appendChild(firstSlideClone); // Append the clone image to the end
    let slideIndex = 0;
    const realTotalSlides = slides.length; // The number of original slides

    function updateSlidePosition() {
        slideshowInner.style.transition = "margin-left 1s ease-in-out";
        slideshowInner.style.marginLeft = `-${slideIndex * 1340}px`;
    }
    function moveToNextSlide() {
        if (slideIndex < realTotalSlides) {
            slideIndex++;
            updateSlidePosition();
        } else {
            // When reaching the cloned slide, instantly reset to the first slide without transition
            slideshowInner.style.transition = "none";
            slideshowInner.style.marginLeft = "0px"; // Instantly reset to the beginning
            slideIndex = 0; // Reset to the first slide index

            // Use setTimeout to re-enable the transition for the next move
            setTimeout(() => {
                slideshowInner.style.transition = "margin-left 1s ease-in-out";
            }, 10);
        }
    }

    function moveToPreviousSlide() {
        if (slideIndex > 0) {
            slideIndex--;
        } else {
            // If we're at the first slide and going back, move to the last slide
            slideIndex = realTotalSlides - 1; // Set index to the last original slide
        }
        // animate
        updateSlidePosition();
    }

    document.querySelector(".slideshow__button--next").addEventListener("click", moveToNextSlide);
    document.querySelector(".slideshow__button--back").addEventListener("click", moveToPreviousSlide);

    slideshowInner.addEventListener("transitionend", function () {
        // Check if we're at the cloned slide and reset to the first slide without transition
        if (slideIndex === realTotalSlides) {
            slideshowInner.style.transition = "none";
            slideshowInner.style.marginLeft = "0px"; // Instantly move to the first slide
            slideIndex = 0; // Reset to the first slide index
        }
    });
});
