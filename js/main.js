// ============================================
// MATECITO V3 - FOGÓN DIGITAL CORE
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

    // 2. FORMULARIO CHASQUI (WHATSAPP INTEGRATION)
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
                const mensaje = document.getElementById('mensaje').value;

                if (!nombre || !contacto || !mensaje) {
                    alert('⚠️ Che, completá todos los datos así te podemos responder bien.');
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'cursor-not-allowed');
                    return;
                }

                // Formato amigable para el mensaje de WhatsApp
                const text = `👋 *¡Hola Matecito! LLegó un Chasqui Digital* %0A%0A👤 *Soy:* ${nombre}%0A📱 *Mi contacto es:* ${contacto}%0A💬 *La idea es:* ${mensaje}%0A%0A_Enviado desde la web del Fogón Digital_`;

                const url = `https://wa.me/543425370985?text=${text}`;

                window.open(url, '_blank');

                // Confirmación visual
                btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span> ¡Mensaje Enviado!';
                btn.classList.remove('bg-brand-orange');
                btn.classList.add('bg-green-600');

                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'cursor-not-allowed', 'bg-green-600');
                    btn.classList.add('bg-brand-orange');
                    form.reset();
                }, 4000);

            }, 1500); // Pequeña demora para dar sensación de proceso
        });
    }

    // 3. EFECTO PARALAJE SUAVE EN IMÁGENES
    // ------------------------------------------------
    const images = document.querySelectorAll('.group img');

    images.forEach(img => {
        img.addEventListener('mousemove', (e) => {
            const { width, height, left, top } = img.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            const xPercent = x / width;
            const yPercent = y / height;

            const moveX = (xPercent - 0.5) * 10; // Rango de movimiento en pixeles
            const moveY = (yPercent - 0.5) * 10;

            img.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1.05) translate(0, 0)';
        });
    });
});
