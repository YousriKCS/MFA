const textSizeButtons = document.querySelectorAll("[data-text-scale]");

textSizeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const scale = button.getAttribute("data-text-scale");

        document.documentElement.style.setProperty(
            "--text-scale",
            scale
        );

        textSizeButtons.forEach(function (otherButton) {
            otherButton.setAttribute("aria-pressed", "false");
        });

        button.setAttribute("aria-pressed", "true");
    });
});