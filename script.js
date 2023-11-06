jQuery(document).ready(function () {
    giftOpen();
});

//Gift Open

function giftOpen() {
    jQuery("section.gift").on("click", function () {
    
                jQuery(".error").hide();
                jQuery(".lbWrapper,.lbWrapper .signupWrapper").hide();
                jQuery(".gift-top").removeClass("hovered");
                jQuery(".gift-text").hide();
                
                jQuery(".gift-final-text").show();
                jQuery(".gift-bottom").addClass("fadeout");
                jQuery(".gift-top").addClass("fadeout");
                //jQuery(".santa-wrapper").fadeIn(5000);
                setTimeout(function () {
                    jQuery(".santa-wrapper").fadeIn(5000);
                }, 500);
                setTimeout(function () {
                    jQuery("#merry").show(1000);
                    jQuery("#houu").fadeIn(1000);
                    jQuery("#box").fadeIn(1000);
                }, 1000);
                //jQuery(".gift-card-text").fadeIn(5000);

    });
}

//Snow Fall

function createSnow() {

    var particles = [];
    var particleSize = 3;
    var maxParticles = 1000;
    var particleOpacity = .9;

    // Initialize canvas
    var canvas = document.getElementById('snow');
    var ctx = canvas.getContext('2d');

    // Get window width & height
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    // Apply canvas size based on window width & height.
    // This can be changed to bound within an element instead.
    canvas.width = windowWidth;
    canvas.height = windowHeight;

    // Push particle iteration
    for (var i = 0; i < maxParticles; i++) {

        particles.push({

            // Particle x position
            x: Math.random() * windowWidth,

            // Particle y position
            y: Math.random() * windowHeight,

            // Particle radius
            r: Math.random(Math.min(particleSize)) * particleSize,

            // Particle density 
            d: Math.random() * maxParticles,
        });
    }

    // Render particles
    function render() {

        ctx.clearRect(0, 0, windowWidth, windowHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + particleOpacity + ')';
        ctx.beginPath();

        for (var i = 0; i < maxParticles; i++) {

            // Iterate the particles.
            var p = particles[i];

            // Move particles along x, y.
            ctx.moveTo(p.x, p.y);

            // Draw particle.
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        }

        ctx.fill();
        update();
    }

    // To create a more dynamic and organic flow, we need to apply an
    // incremental 'angle' that will iterate through each particle flow.
    var angle = 0.005;

    // Update particles
    function update() {

        // Incremental angle.
        angle += 0.005;

        for (var i = 0; i < maxParticles; i++) {

            var p = particles[i];

            // Offset the particles flow based on the angle.
            p.y += Math.cos(p.d) + p.r;
            p.x += Math.sin(angle) * Math.PI / 10;

            // Re-iterate the particles to the top once the particle has
            // reached the bottom of the window.
            if (p.y > windowHeight) {

                particles[i] = {

                    x: Math.random() * windowWidth,
                    y: 0,
                    r: p.r,
                    d: p.d
                };
            }
        }
    }

    
    // Call function.
  
}
