// ==========================================================================
//   Animated Background (Canvas Particles)
// ==========================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const particleCount = Math.floor((width * height) / 15000); // Responsive amount

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 1.5 + 0.5
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.3)';
    
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 217, 255, ${0.15 - dist / 120 * 0.15})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', initCanvas);
initCanvas();
drawParticles();

// ==========================================================================
//   Navbar Scroll Effect
// ==========================================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==========================================================================
//   Scroll Reveal Observer
// ==========================================================================
const revealElements = document.querySelectorAll('.reveal');
const timelineLine = document.querySelector('.timeline-progress');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Trigger Counter animation if exists inside revealed element
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(counter => animateCounter(counter));

            // Stop observing once revealed
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
revealElements.forEach(el => revealObserver.observe(el));

// ==========================================================================
//   Number Counter Animation
// ==========================================================================
function animateCounter(counterElement) {
    const target = +counterElement.getAttribute('data-target');
    const duration = 2000; // ms
    const increment = target / (duration / 16); // 60fps
    
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counterElement.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.innerText = target.toLocaleString();
        }
    };
    
    updateCounter();
}

// Initial count trigger for elements available without scroll
setTimeout(() => {
    document.querySelectorAll('.statistics .counter').forEach(counter => {
        animateCounter(counter);
    });
}, 800); 

// ==========================================================================
//   Timeline Scroll Progress
// ==========================================================================
window.addEventListener('scroll', () => {
    const timeline = document.querySelector('.timeline');
    if (!timeline || !timelineLine) return;
    
    const rect = timeline.getBoundingClientRect();
    const timelineHeight = rect.height;
    let progress = ((window.innerHeight / 2) - rect.top) / timelineHeight;
    progress = Math.max(0, Math.min(1, progress));
    timelineLine.style.height = `${progress * 100}%`;
});

// ==========================================================================
//   Mouse Glow Effect on Glass Cards
// ==========================================================================
const cards = document.querySelectorAll('.glass-card');
cards.forEach(card => {
    const glow = card.querySelector('.card-glow');
    if (!glow) return;
    
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
    });
});

// ==========================================================================
//   Lead Form Submission (Integration with Frappe API)
// ==========================================================================
const leadForm = document.getElementById('leadForm');
const leadFormAlert = document.getElementById('leadFormAlert');
const btnSubmitLead = document.getElementById('btnSubmitLead');
const btnText = btnSubmitLead.querySelector('.btn-text');
const submitLoader = document.getElementById('submitLoader');
const btnIcon = btnSubmitLead.querySelector('i');

if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Get values
        const name = document.getElementById('leadName').value;
        const email = document.getElementById('leadEmail').value;
        const phone = document.getElementById('leadPhone').value;
        const company = document.getElementById('leadCompany').value;
        const industry = document.getElementById('leadIndustry').value;

        // 2. Loading State
        btnText.style.display = 'none';
        btnIcon.style.display = 'none';
        submitLoader.style.display = 'block';
        btnSubmitLead.disabled = true;

        try {
            // 3. Make POST Request to custom Frappe API endpoint
            const response = await fetch('/api/method/primer_webpage.api.create_lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    first_name: name,
                    email: email,
                    phone: phone,
                    company_name: company,
                    industry: industry
                })
            });

            const data = await response.json();

            // Frappe encapsulates method returns inside "message" object
            if (data.message && data.message.status === 'success') {
                leadFormAlert.className = 'form-alert success';
                leadFormAlert.innerText = data.message.message;
                leadForm.reset();
            } else {
                leadFormAlert.className = 'form-alert error';
                leadFormAlert.innerText = (data.message && data.message.message) ? data.message.message : "Something went wrong.";
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            leadFormAlert.className = 'form-alert error';
            leadFormAlert.innerText = "Connection error. Please try again later.";
        } finally {
            // Restore button state
            btnText.style.display = 'inline-block';
            btnIcon.style.display = 'inline-block';
            submitLoader.style.display = 'none';
            btnSubmitLead.disabled = false;
        }
    });
}
