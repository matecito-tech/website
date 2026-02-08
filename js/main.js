// ============================================
// MATECITO V3.1 - FOGÓN DIGITAL CORE
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. SMOOTH SCROLL PARA TODOS LOS LINKS
    // ------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // 2. NAVBAR SCROLL EFFECT
    // ------------------------------------------------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md');
            navbar.classList.replace('bg-brand-cream/80', 'bg-white/90'); // Ajuste dinámico si fuera necesario
        } else {
            navbar.classList.remove('shadow-md');
        }
    });

    // 3. FORMULARIO CHASQUI (WHATSAPP INTEGRATION)
    // ------------------------------------------------
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button');
            const originalContent = btn.innerHTML;

            // Estado de "Enviando..."
            btn.innerHTML = '<span class="material-symbols-rounded animate-spin">refresh</span> Preparando el mate...';
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');

            setTimeout(() => {
                const nombre = document.getElementById('nombre').value;
                const contacto = document.getElementById('contacto_dato').value;
                const servicio = document.getElementById('asunto') ? document.getElementById('asunto').value : 'Consulta General';
                const mensaje = document.getElementById('mensaje').value;

                if (!nombre || !contacto || !mensaje) {
                    alert('⚠️ Che, completá todos los datos así te podemos responder bien.');
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'cursor-not-allowed');
                    return;
                }

                // Formato de Mensaje WhatsApp
                const text = `👋 *¡Hola Matecito! Nuevo Chasqui* %0A%0A👤 *Nombre:* ${nombre}%0A📱 *Contacto:* ${contacto}%0A📌 *Interés:* ${servicio}%0A💬 *Mensaje:* ${mensaje}%0A%0A_Enviado desde matecito.tech_`;

                const url = `https://wa.me/543425370985?text=${text}`;

                window.open(url, '_blank');

                // Confirmación visual
                btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span> ¡Enviado!';
                btn.classList.remove('bg-brand-orange');
                btn.classList.add('bg-green-600');

                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'cursor-not-allowed', 'bg-green-600');
                    btn.classList.add('bg-brand-orange');
                    form.reset();
                }, 4000);

            }, 1000);
        });
    }

    // 4. Parallax Simple en Imágenes (Opcional, si afecta performance quitar)
    const images = document.querySelectorAll('.group img');
    if (window.matchMedia("(min-width: 768px)").matches) {
        images.forEach(img => {
            img.addEventListener('mousemove', (e) => {
                const { width, height, left, top } = img.getBoundingClientRect();
                const x = e.clientX - left;
                const y = e.clientY - top;
                const moveX = ((x / width) - 0.5) * 10;
                const moveY = ((y / height) - 0.5) * 10;
                img.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
            });
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1.05) translate(0, 0)';
            });
        });
    }
});
