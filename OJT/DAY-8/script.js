document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const skillButtons = document.querySelectorAll('.skill-btn');
    const contactItems = document.querySelectorAll('.contact-item');
    const skillDetail = document.querySelector('.skill-detail');
    const contactDetails = document.querySelector('.contact-details');

    const toast = createToast();
    const slideUpItems = document.querySelectorAll('.slide-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    slideUpItems.forEach(item => revealObserver.observe(item));

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveNav(button);
            }
        });
    });

    skillButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveSkill(button);
            updateSkillDetail(button);
            showToast(`Selected skill: ${button.dataset.skill}`);
        });
    });

    contactItems.forEach(item => {
        item.addEventListener('click', () => {
            setActiveContact(item);
            updateContactDetail(item);
            copyText(item.dataset.value);
            showToast(`${capitalize(item.dataset.type)} copied to clipboard`);
        });
    });

    function setActiveNav(activeButton) {
        navButtons.forEach(button => button.classList.toggle('active', button === activeButton));
    }

    function setActiveSkill(activeButton) {
        skillButtons.forEach(button => button.classList.toggle('active', button === activeButton));
    }

    function setActiveContact(activeItem) {
        contactItems.forEach(item => item.classList.toggle('active', item === activeItem));
    }

    function updateSkillDetail(button) {
        skillDetail.innerHTML = `
            <strong>${button.dataset.skill}</strong>
            <p>${button.dataset.detail}</p>
        `;
    }

    function updateContactDetail(item) {
        contactDetails.innerHTML = `
            <strong>${capitalize(item.dataset.type)}:</strong> ${item.dataset.value}
            <p>${item.dataset.note}</p>
        `;
    }

    function copyText(text) {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).catch(() => {
            console.warn('Clipboard copy failed.');
        });
    }

    function createToast() {
        const toastElement = document.createElement('div');
        toastElement.className = 'toast';
        document.body.appendChild(toastElement);
        return toastElement;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
});