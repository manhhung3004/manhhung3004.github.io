// Smooth page transition on link clicks
document.addEventListener('DOMContentLoaded', function () {
    // Get all internal links
    const links = document.querySelectorAll('a[href]:not([target="_blank"])');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only apply transition for internal HTML links
            if (href && href.endsWith('.html') && !href.startsWith('tel:')) {
                e.preventDefault();

                // Add fade-out animation
                document.body.style.animation = 'pageExit 0.4s ease-in forwards';

                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
});
