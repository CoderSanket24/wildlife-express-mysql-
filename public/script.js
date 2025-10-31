function redirect(link) {
    window.location.href = `./${link}`;
}

// Create floating leaves animation
function createFloatingLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'floating-leaf';
    leaf.innerHTML = Math.random() > 0.5 ? '🍃' : '🌿';
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.animationDelay = Math.random() * 5 + 's';
    leaf.style.animationDuration = (Math.random() * 4 + 6) + 's';

    document.querySelector('.bg-animation').appendChild(leaf);

    // Remove leaf after animation completes
    setTimeout(() => {
        if (leaf.parentNode) {
            leaf.parentNode.removeChild(leaf);
        }
    }, 10000);
}

// Create leaves periodically
setInterval(createFloatingLeaf, 2000);

// Initial leaves
for (let i = 0; i < 5; i++) {
    setTimeout(createFloatingLeaf, i * 500);
}

// Add notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed; bottom: 100px; right: 620px; 
                background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'}; 
                color: white; padding: 15px 20px; border-radius: 10px; 
                z-index: 1001; font-weight: bold;
                transform: translateY(300px); transition: transform 0.3s ease;
                max-width: 300px;
            `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateY(300px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add hover effects to data cards
document.querySelectorAll('.data-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animate stat numbers on page load
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const originalText = stat.textContent;
        const isCurrency = originalText.includes('₹');
        
        // Extract number from text (handle currency and commas)
        const numberMatch = originalText.match(/[\d,]+/);
        if (!numberMatch) return;
        
        const finalNumber = parseInt(numberMatch[0].replace(/,/g, ''));
        if (isNaN(finalNumber)) return;
        
        let currentNumber = 0;
        const increment = finalNumber / 50;

        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                // Restore original formatting
                if (isCurrency) {
                    stat.textContent = `₹${finalNumber.toLocaleString('en-IN')}`;
                } else {
                    stat.textContent = finalNumber.toString();
                }
                clearInterval(timer);
            } else {
                // Show animated number with proper formatting
                const animatedNumber = Math.floor(currentNumber);
                if (isCurrency) {
                    stat.textContent = `₹${animatedNumber.toLocaleString('en-IN')}`;
                } else {
                    stat.textContent = animatedNumber.toString();
                }
            }
        }, 40);
    });
}

// Run animations on page load
window.addEventListener('load', () => {
    setTimeout(animateNumbers, 500);
});

// Photo Gallery Data
const photoGalleries = {
    tiger: [
        {
            title: "Adult Male Bengal Tiger",
            details: "Magnificent adult male tiger spotted in Core Zone A during morning patrol. Estimated age: 8-10 years. Weight: ~220kg. This individual has been tracked since 2019 and shows excellent health.",
            icon: "🐅",
            gradient: "linear-gradient(135deg, #FF6B35, #F7931E)"
        },
        {
            title: "Tigress with Cubs",
            details: "Female tiger with two young cubs, approximately 6 months old. Located near the water source in Zone A. Mother appears protective and well-nourished. Cubs showing normal playful behavior.",
            icon: "🐅",
            gradient: "linear-gradient(135deg, #FF8F00, #FFB300)"
        },
        {
            title: "Tiger Hunting Behavior",
            details: "Rare capture of tiger in hunting stance near prey trail. Photographed using camera trap TRP-15. Time: 05:45 AM. This behavior indicates healthy hunting instincts and territory marking.",
            icon: "🐅",
            gradient: "linear-gradient(135deg, #E65100, #FF6F00)"
        },
        {
            title: "Tiger Territory Marking",
            details: "Adult tiger marking territory boundaries through scent marking. Critical behavior for maintaining ecosystem balance and preventing human-wildlife conflict.",
            icon: "🐅",
            gradient: "linear-gradient(135deg, #D84315, #FF3D00)"
        }
    ],
    elephant: [
        {
            title: "Elephant Herd Leader",
            details: "Matriarch leading her family group of 12 elephants. Age estimated at 45-50 years. This female has successfully led the herd through multiple seasons and shows excellent maternal care.",
            icon: "🐘",
            gradient: "linear-gradient(135deg, #546E7A, #78909C)"
        },
        {
            title: "Baby Elephant",
            details: "3-month-old elephant calf staying close to mother. Weight: ~180kg. Shows normal development milestones. First successful birth recorded in this herd since 2022.",
            icon: "🐘",
            gradient: "linear-gradient(135deg, #455A64, #607D8B)"
        },
        {
            title: "Elephants at Water Source",
            details: "Herd enjoying daily bath and water play at the main reservoir in Buffer Zone B. This behavior is essential for skin health and social bonding within the group.",
            icon: "🐘",
            gradient: "linear-gradient(135deg, #37474F, #546E7A)"
        },
        {
            title: "Elephant Migration Path",
            details: "Annual migration route documentation showing traditional pathways used by elephant herds for over 50 years. Important for corridor conservation planning.",
            icon: "🐘",
            gradient: "linear-gradient(135deg, #263238, #37474F)"
        }
    ],
    deer: [
        {
            title: "Spotted Deer Grazing",
            details: "Healthy adult spotted deer grazing in natural meadow. Part of a larger herd of 25 individuals. Shows excellent body condition and no signs of disease or stress.",
            icon: "🦌",
            gradient: "linear-gradient(135deg, #8D6E63, #A1887F)"
        },
        {
            title: "Deer Herd Formation",
            details: "Large herd gathering during evening hours. Mixed age groups including adults, juveniles, and young fawns. Excellent indicator of healthy ecosystem balance.",
            icon: "🦌",
            gradient: "linear-gradient(135deg, #6D4C41, #8D6E63)"
        },
        {
            title: "Young Fawn",
            details: "2-week-old spotted deer fawn with characteristic white spots. Mother nearby maintaining protective watch. Birth recorded as part of spring population increase.",
            icon: "🦌",
            gradient: "linear-gradient(135deg, #5D4037, #795548)"
        },
        {
            title: "Deer Alert Behavior",
            details: "Alert posture displayed when detecting predator presence. This behavior is crucial for herd survival and demonstrates healthy predator-prey relationship dynamics.",
            icon: "🦌",
            gradient: "linear-gradient(135deg, #4E342E, #5D4037)"
        }
    ]
};

let currentGallery = '';
let currentPhotoIndex = 0;

// Open Lightbox
function openLightbox(species, photoIndex) {
    currentGallery = species;
    currentPhotoIndex = photoIndex;

    const lightbox = document.getElementById('lightbox');
    const photo = photoGalleries[species][photoIndex];

    document.getElementById('lightbox-image').style.background = photo.gradient;
    document.getElementById('lightbox-image').innerHTML = photo.icon;
    document.getElementById('lightbox-title').textContent = photo.title;
    document.getElementById('lightbox-details').textContent = photo.details;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Add entrance animation
    const content = lightbox.querySelector('.lightbox-content');
    content.style.transform = 'scale(0.8) translateY(50px)';
    content.style.opacity = '0';

    setTimeout(() => {
        content.style.transform = 'scale(1) translateY(0)';
        content.style.opacity = '1';
        content.style.transition = 'all 0.3s ease';
    }, 10);
}

// Close Lightbox
function closeLightbox(event) {
    if (event && event.target !== event.currentTarget) return;

    const lightbox = document.getElementById('lightbox');
    const content = lightbox.querySelector('.lightbox-content');

    content.style.transform = 'scale(0.8) translateY(50px)';
    content.style.opacity = '0';

    setTimeout(() => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }, 300);
}

function updateLightboxContent() {
    const photo = photoGalleries[currentGallery][currentPhotoIndex];
    const imageEl = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const detailsEl = document.getElementById('lightbox-details');

    // Fade out
    imageEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    detailsEl.style.opacity = '0';

    setTimeout(() => {
        imageEl.style.background = photo.gradient;
        imageEl.innerHTML = photo.icon;
        titleEl.textContent = photo.title;
        detailsEl.textContent = photo.details;

        // Fade in
        imageEl.style.opacity = '1';
        titleEl.style.opacity = '1';
        detailsEl.style.opacity = '1';
    }, 150);
}

