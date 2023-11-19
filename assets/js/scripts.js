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

//  create a settings button that allows  to switch between dark and light themes
document.addEventListener("DOMContentLoaded", (event) => {
    const settingsBtn = document.getElementById("settings-btn");
    const themeModal = document.getElementById("theme_modal");
    const lightThemeBtn = document.getElementById("light-theme");
    const darkThemeBtn = document.getElementById("dark-theme");

    // settingsBtn.addEventListener("click", () => {
    //     themeModal.classList.toggle("themeModal--visible");
    // });
    settingsBtn.addEventListener("click", () => {
        const isVisible = themeModal.classList.contains("themeModal--visible");
        if (isVisible) {
            themeModal.classList.remove("themeModal--visible");
        } else {
            themeModal.classList.add("themeModal--visible");
        }
    });

    lightThemeBtn.addEventListener("click", () => {
        document.documentElement.classList.remove("dark");
        themeModal.classList.remove("themeModal--visible");
    });

    darkThemeBtn.addEventListener("click", () => {
        document.documentElement.classList.add("dark");
        themeModal.classList.remove("themeModal--visible");
    });

    // Close the modal if a click occurs outside of it
    document.addEventListener("click", (e) => {
        if (
            !themeModal.contains(e.target) &&
            !settingsBtn.contains(e.target) &&
            themeModal.classList.contains("themeModal--visible")
        ) {
            themeModal.classList.remove("themeModal--visible");
        }
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
            items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}
