// ==========================================
// COST CALCULATOR LOGIC
// ==========================================

// Pricing Configuration (MAD per m² - Updated 2025)
const PRICING = {
    industrial: { base: 5000, min: 4000, max: 6500 },
    residential: { base: 6000, min: 5000, max: 8000 },
    commercial: { base: 8000, min: 6500, max: 10000 },
    medical: { base: 12000, min: 10000, max: 15000 }
};

const SERVICE_WEIGHTS = {
    structure: 0.03, // BET Structure ~3%
    construction: 0.45, // Gros Œuvre ~45%
    fluids: 0.20 // Fluides/CVC ~20%
};

const STANDING_MULTIPLIERS = {
    high: 1.5,
    mid: 1.0,
    econ: 0.7
};

const FINISH_MULTIPLIERS = {
    standard: 1.0,
    premium: 1.4,
    luxe: 1.8
};

// Calculator State
const calculatorState = {
    currentStep: 1,
    totalSteps: 5,
    projectType: null,
    surface: 500,
    services: ['structure'],
    standing: 'mid',
    finish: 'standard'
};

// DOM Elements
const modal = document.getElementById('calculatorModal');
const openBtn = document.getElementById('openCalculator');
const closeBtn = document.getElementById('closeCalculator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressLine = document.getElementById('progressLine');
const surfaceSlider = document.getElementById('surfaceSlider');
const surfaceValue = document.getElementById('surfaceValue');

// ==========================================
// MODAL CONTROLS
// ==========================================
const openCalculator = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetCalculator();
};

const closeCalculator = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

const resetCalculator = () => {
    calculatorState.currentStep = 1;
    calculatorState.projectType = null;
    calculatorState.surface = 500;
    calculatorState.services = ['structure'];
    calculatorState.finish = 'standard';

    // Reset UI
    document.querySelectorAll('.calculator-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.calculator-step[data-step="1"]').classList.add('active');

    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');

    updateProgressBar();
    updateNavigationButtons();
};

// ==========================================
// NAVIGATION
// ==========================================
const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > calculatorState.totalSteps) return;

    // Hide current step
    document.querySelector(`.calculator-step[data-step="${calculatorState.currentStep}"]`).classList.remove('active');

    // Show new step
    document.querySelector(`.calculator-step[data-step="${stepNumber}"]`).classList.add('active');

    // Update progress
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active');
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed');
        }
    });

    calculatorState.currentStep = stepNumber;
    updateProgressBar();
    updateNavigationButtons();

    // Calculate price when reaching step 5
    if (stepNumber === 5) {
        calculateAndDisplayPrice();
    }
};

const nextStep = () => {
    // Validation
    if (calculatorState.currentStep === 1 && !calculatorState.projectType) {
        alert('Veuillez sélectionner un type de projet');
        return;
    }

    if (calculatorState.currentStep < calculatorState.totalSteps) {
        goToStep(calculatorState.currentStep + 1);
    } else {
        // Submit form
        submitLeadForm();
    }
};

const prevStep = () => {
    if (calculatorState.currentStep > 1) {
        goToStep(calculatorState.currentStep - 1);
    }
};

const updateProgressBar = () => {
    const progress = ((calculatorState.currentStep - 1) / (calculatorState.totalSteps - 1)) * 100;
    progressLine.style.width = `${progress}%`;
};

const updateNavigationButtons = () => {
    // Previous button
    if (calculatorState.currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // Next button text
    if (calculatorState.currentStep === calculatorState.totalSteps) {
        nextBtn.textContent = nextBtn.getAttribute('data-submit-text') || 'Envoyer';
        nextBtn.setAttribute('data-i18n', 'calc_btn_submit');
    } else {
        nextBtn.textContent = nextBtn.getAttribute('data-next-text') || 'Suivant';
        nextBtn.setAttribute('data-i18n', 'calc_btn_next');
    }
};

// ==========================================
// STEP 1: PROJECT TYPE
// ==========================================
document.querySelectorAll('.project-type-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.project-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        calculatorState.projectType = card.getAttribute('data-type');

        // Show/Hide residential options
        const resOptions = document.getElementById('residentialOptions');
        if (calculatorState.projectType === 'residential') {
            resOptions.style.display = 'block';
            // Trigger animation or scroll
            resOptions.classList.add('fadeInStep');
        } else {
            resOptions.style.display = 'none';
        }
    });
});

// Standing Selection Logic
document.querySelectorAll('.standing-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.standing-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        calculatorState.standing = card.getAttribute('data-standing');
    });
});

// ==========================================
// STEP 2: SURFACE
// ==========================================
if (surfaceSlider) {
    surfaceSlider.addEventListener('input', (e) => {
        calculatorState.surface = parseInt(e.target.value);
        surfaceValue.textContent = calculatorState.surface;
    });
}

// ==========================================
// STEP 3: SERVICES
// ==========================================
document.querySelectorAll('input[name="service"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        calculatorState.services = Array.from(document.querySelectorAll('input[name="service"]:checked'))
            .map(cb => cb.value);
    });
});

// ==========================================
// STEP 4: FINISH LEVEL
// ==========================================
document.querySelectorAll('.finish-level-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.finish-level-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        calculatorState.finish = card.getAttribute('data-finish');
    });
});

// ==========================================
// PRICE CALCULATION
// ==========================================
const calculateAndDisplayPrice = () => {
    const pricing = PRICING[calculatorState.projectType];
    if (!pricing) return;

    // Base price per m2
    let basePricePerM2 = pricing.base;

    // Apply standing multiplier ONLY for residential
    if (calculatorState.projectType === 'residential') {
        basePricePerM2 *= STANDING_MULTIPLIERS[calculatorState.standing];
    }

    // Calculate total base cost
    let totalBaseCost = basePricePerM2 * calculatorState.surface;

    // Calculate service weight multiplier
    // A project with all services = 100% of the calculated base cost
    // A project with only some services = reduced cost based on weights
    let totalWeight = 0;
    calculatorState.services.forEach(service => {
        totalWeight += SERVICE_WEIGHTS[service] || 0;
    });

    // Normalize weights relative to a full project (BET+GO+Fluids = 0.03 + 0.45 + 0.20 = 0.68)
    // We treat 0.68 as 100% of the expected construction cost for this tool
    const maxWeight = 0.68;
    const weightFactor = totalWeight / maxWeight;

    let basePrice = totalBaseCost * weightFactor;

    // Apply finish multiplier (Second Œuvre quality)
    const finishMultiplier = FINISH_MULTIPLIERS[calculatorState.finish];
    const finalPrice = basePrice * finishMultiplier;

    // Calculate range (+/- 15% variation)
    const minPrice = finalPrice * 0.85;
    const maxPrice = finalPrice * 1.15;

    // Display with animation
    animatePrice(finalPrice, minPrice, maxPrice);

    // Update hidden form fields
    document.getElementById('hiddenProjectType').value = calculatorState.projectType;
    document.getElementById('hiddenSurface').value = calculatorState.surface;
    document.getElementById('hiddenServices').value = calculatorState.services.join(', ');
    document.getElementById('hiddenFinish').value = calculatorState.finish;
    document.getElementById('hiddenPrice').value = Math.round(finalPrice);
};

const animatePrice = (finalPrice, minPrice, maxPrice) => {
    const priceResult = document.getElementById('priceResult');
    const priceRange = document.getElementById('priceRange');

    let current = 0;
    const target = Math.round(finalPrice);
    const increment = target / 50;
    const duration = 1500;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            priceResult.textContent = formatPrice(target);
            clearInterval(timer);
        } else {
            priceResult.textContent = formatPrice(Math.round(current));
        }
    }, stepTime);

    priceRange.textContent = `Fourchette: ${formatPrice(Math.round(minPrice))} - ${formatPrice(Math.round(maxPrice))}`;
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// ==========================================
// LEAD FORM SUBMISSION
// ==========================================
const submitLeadForm = async () => {
    const form = document.getElementById('calculatorLeadForm');
    const formData = new FormData(form);

    // Validate required fields
    const name = formData.get('name');
    const email = formData.get('email');

    if (!name || !email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Disable button
    nextBtn.disabled = true;
    nextBtn.textContent = 'Envoi en cours...';

    try {
        // Send to FormSubmit (you'll need to configure this)
        const response = await fetch('https://formsubmit.co/ajax/ibebuilds@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Success
            nextBtn.textContent = 'Envoyé ✓';
            nextBtn.style.background = '#27ae60';

            // Track conversion
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Calculator Lead',
                    value: formData.get('estimatedPrice'),
                    currency: 'MAD'
                });
            }

            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': 'calculator_lead_submitted',
                    'project_type': calculatorState.projectType,
                    'estimated_value': formData.get('estimatedPrice')
                });
            }

            // Close modal after delay
            setTimeout(() => {
                closeCalculator();
                alert('Merci ! Nous vous enverrons votre devis détaillé sous 24-48h.');
            }, 2000);
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        nextBtn.textContent = 'Erreur - Réessayez';
        nextBtn.style.background = '#e74c3c';

        setTimeout(() => {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Envoyer';
            nextBtn.style.background = '';
        }, 3000);
    }
};

// ==========================================
// EVENT LISTENERS
// ==========================================
if (openBtn) openBtn.addEventListener('click', openCalculator);
if (closeBtn) closeBtn.addEventListener('click', closeCalculator);
if (prevBtn) prevBtn.addEventListener('click', prevStep);
if (nextBtn) nextBtn.addEventListener('click', nextStep);

// Close on overlay click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeCalculator();
    }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeCalculator();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNavigationButtons();
    updateProgressBar();
});
