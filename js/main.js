
// ===== CONFIGURATION EMAILJS =====
(function() {
    emailjs.init({
        publicKey: "96Vs5JHeUFdzzpmzr" // Remplacez par votre clé publique EmailJS
    });
})();

// ===== VARIABLES GLOBALES =====
let autoRotate = true;

// ===== GESTION DU THÈME =====
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// ===== MODULE =====
function toggleModule(id) {
    const module = document.getElementById('module-' + id);
    const content = document.getElementById('content-' + id);
    if (module && content) {
        module.classList.toggle('active');
        content.classList.toggle('active');
    }
}

// ===== MODALE 3D =====
function openModal(id) {
    event.stopPropagation();
    const modal = document.getElementById('modal-' + id);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        const viewer = modal.querySelector('model-viewer');
        if (viewer) {
            viewer.addEventListener('load', () => showToast('Modèle chargé!', 'success'), { once: true });
            viewer.addEventListener('error', () => showToast('Erreur de chargement', 'error'), { once: true });
        }
    }
}

function closeModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// ===== CONTRÔLES 3D =====
function toggleRotation(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const viewer = document.querySelector('.modal.show model-viewer');
    if (!viewer) return;
    
    autoRotate = !autoRotate;
    
    if (autoRotate) {
        viewer.setAttribute('auto-rotate', '');
        btn.classList.add('active');
    } else {
        viewer.removeAttribute('auto-rotate');
        btn.classList.remove('active');
    }
}

function resetView(e) {
    e.stopPropagation();
    const viewer = document.querySelector('.modal.show model-viewer');
    if (viewer) {
        viewer.cameraOrbit = '0deg 75deg 105%';
        viewer.fieldOfView = '45deg';
    }
}

function toggleFullscreen(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const viewer = document.querySelector('.modal-viewer');
    
    if (!viewer) return;
    
    if (!document.fullscreenElement) {
        viewer.requestFullscreen().then(() => {
            btn.classList.add('active');
            btn.querySelector('i').className = 'fas fa-compress';
        }).catch(err => {
            console.error('Erreur plein écran:', err);
        });
    } else {
        document.exitFullscreen();
        btn.classList.remove('active');
        btn.querySelector('i').className = 'fas fa-expand';
    }
}

// ===== ENVOI D'EMAIL =====
// Remplace la fonction sendEmail par celle-ci
function sendEmail(event) {
    event.preventDefault();

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    // Validation basique
    const name = document.getElementById('name')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const subject = document.getElementById('subject')?.value?.trim() || '';
    const message = document.getElementById('message')?.value?.trim() || '';

    if (!name || !email || !message) {
        showToast('Veuillez remplir au moins le nom, l\'email et le message.', 'error');
        return;
    }
    // simple regex pour vérifier l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Adresse e-mail invalide.', 'error');
        return;
    }

    // Désactiver le bouton pendant l'envoi
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

    // Prépare les paramètres — assure-toi que les noms correspondent à ceux utilisés dans ton template EmailJS
    
    const templateParams = {
    name: name,
    email: email,
    title: subject,
    message: message,
    reply_to: email
};


    // Envoi : on ajoute la publicKey également en 4ème argument pour être certain
    const SERVICE_ID = 'service_n77t8gii';
    const TEMPLATE_ID = 'template_zwiii2s';
    const PUBLIC_KEY = '96Vs5JHeUFdzzpmzr'; // ta clé publique

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY })
        .then(function(response) {
            console.log('✅ Email envoyé avec succès!', response.status, response.text);

            if (successMessage) {
                successMessage.style.display = 'block';
                successMessage.classList.add('show');
            }
            if (errorMessage) {
                errorMessage.style.display = 'none';
                errorMessage.classList.remove('show');
            }

            form.reset();

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le Message';

            setTimeout(() => {
                if (successMessage) {
                    successMessage.style.display = 'none';
                    successMessage.classList.remove('show');
                }
            }, 5000);

            showToast('Message envoyé avec succès!', 'success');
        }, function(error) {
            console.error('❌ Erreur lors de l\'envoi:', error);

            if (errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.classList.add('show');
            }
            if (successMessage) {
                successMessage.style.display = 'none';
                successMessage.classList.remove('show');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le Message';

            setTimeout(() => {
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                    errorMessage.classList.remove('show');
                }
            }, 5000);

            showToast('Erreur lors de l\'envoi. Vérifie la console et le tableau de bord EmailJS.', 'error');
        });
}


// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    toast.animate([
        { opacity: 0, transform: 'translateX(300px)' },
        { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 400, fill: 'forwards' });
    
    setTimeout(() => {
        toast.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 300 }).finished.then(() => toast.remove());
    }, 3000);
}

// ===== NAVIGATION =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

// ===== ANIMATIONS AU SCROLL =====
function reveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach((element, index) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            setTimeout(() => {
                element.classList.add('active');
            }, index * 100);
        }
    });
}

// ===== EFFET PARALLAXE =====
function parallaxEffect() {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    const scrolled = window.pageYOffset;
    
    parallaxSections.forEach((section, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        section.style.transform = `translateY(${yPos * 0.05}px)`;
    });
}

// ===== ANIMATION DES BARRES DE COMPÉTENCES =====
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        const rect = bar.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight - 100 && !bar.classList.contains('animated')) {
            bar.style.setProperty('--skill-width', progress + '%');
            bar.classList.add('animated');
            setTimeout(() => {
                bar.style.width = progress + '%';
            }, 100);
        }
    });
}

// ===== MENU MOBILE =====
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
            mobileMenuBtn.innerHTML = isVisible ? 
                '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        });
        
        // Fermer le menu mobile lors du clic sur un lien
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
        
        // Fermer le menu mobile lors du redimensionnement
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.style.display = 'flex';
            } else {
                navLinks.style.display = 'none';
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// ===== EFFET DE PARTICULES =====
function createParticle(x, y) {
    const particle = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.6;
        z-index: 9999;
        animation: particleFloat 2s ease-out forwards
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
}

// ===== ÉVÉNEMENTS AU SCROLL =====
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    const currentScroll = window.pageYOffset;
    
    // Ajouter/supprimer la classe scrolled
    if (nav) {
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    
    // Mettre à jour les liens actifs
    updateActiveNavLink();
    
    // Effet parallaxe
    parallaxEffect();
    
    // Animer les barres de compétences au scroll
    animateSkillBars();
    
    // Révéler les éléments
    reveal();
});

// ===== ÉVÉNEMENTS CLAVIER =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            closeModal(modal.id.replace('modal-', ''));
        }
    }
});

// ===== ÉVÉNEMENTS SOURIS (PARTICULES) =====
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.98) {
        createParticle(e.clientX, e.clientY);
    }
});

// ===== NAVIGATION FLUIDE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== INITIALISATION AU CHARGEMENT =====
window.addEventListener('DOMContentLoaded', () => {
    // Restaurer le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
    
    // Initialiser les animations
    reveal();
    updateActiveNavLink();
    
    // Menu mobile
    initMobileMenu();
    
    // Animer les barres de compétences
    animateSkillBars();
    
    // Attacher l'événement au formulaire
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', sendEmail);
    }
    
    console.log('✅ Portfolio initialisé avec succès!');
});

// ===== ANIMATION CSS POUR LES PARTICULES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        to {
            transform: translate(calc(-50px + 100px * var(--random, 0.5)), -100px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);



// ===== TÉLÉCHARGEMENT DU MODÈLE 3D =====
function downloadModel(e) {
    e.stopPropagation();
    
    // Animation du bouton
    const btn = e.currentTarget;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = 'models/table-chaise.glb';
    link.download = 'table-chaise.glb';
    link.style.display = 'none';
    
    // Ajouter au DOM
    document.body.appendChild(link);
    
    // Déclencher le téléchargement
    link.click();
    
    // Supprimer du DOM
    setTimeout(() => {
        document.body.removeChild(link);
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 1000);
    
    // Notification
    showToast('Téléchargement du modèle 3D démarré!', 'success');
    
    // Animation du bouton
    btn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
}

















// ========================================
// TOGGLE MODULE WEB3D
// ========================================
function toggleModule(moduleId) {
    const content = document.getElementById('content-' + moduleId);
    const module = document.getElementById('module-' + moduleId);
    const icon = module.querySelector('.toggle i');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        module.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        module.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
}

// ========================================
// MODALES 3D (TP1 - Table & Chaise)
// ========================================
function openModal(modalId) {
    const modal = document.getElementById('modal-' + modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById('modal-' + modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========================================
// MODALE IMAGE (Render PNG)
// ========================================
function openImageModal(event, imageId) {
    event.stopPropagation();
    const modal = document.getElementById('modal-' + imageId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal(imageId) {
    const modal = document.getElementById('modal-' + imageId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========================================
// MODALE VIDEO (TP2 - Scène)
// ========================================
function openVideoModal(event, videoId) {
    event.stopPropagation();
    const modal = document.getElementById('modal-' + videoId);
    const video = document.getElementById(videoId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    video.play();
}

function closeVideoModal(videoId) {
    const modal = document.getElementById('modal-' + videoId);
    const video = document.getElementById(videoId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    video.pause();
    video.currentTime = 0;
}

// ========================================
// CONTRÔLES MODEL-VIEWER
// ========================================
function toggleRotation(event) {
    event.stopPropagation();
    const viewer = event.target.closest('.modal-viewer').querySelector('model-viewer');
    const btn = event.currentTarget;
    
    if (viewer.autoRotate) {
        viewer.autoRotate = false;
        btn.classList.remove('active');
    } else {
        viewer.autoRotate = true;
        btn.classList.add('active');
    }
}

function resetView(event) {
    event.stopPropagation();
    const viewer = event.target.closest('.modal-viewer').querySelector('model-viewer');
    viewer.resetTurntableRotation();
    viewer.cameraOrbit = 'auto auto auto';
}

function toggleFullscreen(event) {
    event.stopPropagation();
    const viewer = event.target.closest('.modal-viewer').querySelector('model-viewer');
    
    if (!document.fullscreenElement) {
        viewer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function downloadModel(event) {
    event.stopPropagation();
    const viewer = event.target.closest('.modal-viewer').querySelector('model-viewer');
    const modelSrc = viewer.getAttribute('src');
    const link = document.createElement('a');
    link.href = modelSrc;
    link.download = modelSrc.split('/').pop();
    link.click();
}
