// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize Socket.IO
const socket = io('http://localhost:3000');

// Mock tracking data for demonstration
const mockTrackingData = {
    'KGL123456789': {
        trackingNumber: 'KGL123456789',
        status: 'in-transit',
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weight: '2.5 kg',
        dimensions: '30 x 20 x 15 cm',
        service: 'Standard Delivery',
        estimatedDelivery: '2023-06-15',
        timeline: [
            {
                id: 1,
                status: 'shipped',
                title: 'Shipment Picked Up',
                location: 'Lagos, Nigeria',
                timestamp: '2023-06-10T09:30:00',
                description: 'Your package has been picked up by our courier.'
            },
            {
                id: 2,
                status: 'in-transit',
                title: 'In Transit',
                location: 'Ibadan, Nigeria',
                timestamp: '2023-06-11T14:15:00',
                description: 'Your package is on its way to the next facility.'
            },
            {
                id: 3,
                status: 'pending',
                title: 'Out for Delivery',
                location: 'Abuja, Nigeria',
                timestamp: null,
                description: 'Your package will be delivered today.'
            },
            {
                id: 4,
                status: 'pending',
                title: 'Delivered',
                location: 'Abuja, Nigeria',
                timestamp: null,
                description: 'Your package has been delivered.'
            }
        ]
    }
};

// Status configuration
const statusConfig = {
    'pending': {
        class: 'text-warning',
        icon: 'clock',
        label: 'Pending'
    },
    'shipped': {
        class: 'text-info',
        icon: 'truck',
        label: 'Shipped'
    },
    'in-transit': {
        class: 'text-primary',
        icon: 'route',
        label: 'In Transit'
    },
    'out-for-delivery': {
        class: 'text-primary',
        icon: 'truck-fast',
        label: 'Out for Delivery'
    },
    'delivered': {
        class: 'text-success',
        icon: 'check-circle',
        label: 'Delivered'
    },
    'exception': {
        class: 'text-danger',
        icon: 'exclamation-triangle',
        label: 'Exception'
    }
};

// Show alert message
function showAlert(message, type = 'info', duration = 5000) {
    const alertsContainer = document.querySelector('.alerts-container');
    if (!alertsContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto dismiss after duration
    setTimeout(() => {
        alert.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => alert.remove(), 300);
    }, duration);
    
    // Add click handler for close button
    const closeBtn = alert.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            alert.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        });
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Pending';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format status
function formatStatus(status) {
    const config = statusConfig[status] || statusConfig.pending;
    return `<span class="${config.class} fw-semibold">${config.label}</span>`;
}

// Render tracking timeline
function renderTimeline(timeline, currentStatus) {
    return timeline.map(step => {
        const isCompleted = step.status === 'delivered' || 
                          (timeline.findIndex(s => s.status === currentStatus) >= timeline.findIndex(s => s.id === step.id));
        const isActive = step.status === currentStatus;
        
        return `
            <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                <div class="timeline-marker">
                    <i class="fas fa-${statusConfig[step.status]?.icon || 'circle'}"></i>
                </div>
                <div class="timeline-content">
                    <h6>${step.title}</h6>
                    <p><i class="fas fa-map-marker-alt"></i> ${step.location}</p>
                    <p><i class="far fa-clock"></i> ${formatDate(step.timestamp)}</p>
                    ${step.description ? `<p class="mt-1">${step.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Track shipment function
async function trackShipment(trackingNumber) {
    const trackingResult = document.getElementById('tracking-result');
    if (!trackingResult) return;
    
    // Show loading state
    trackingResult.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Tracking package ${trackingNumber}...</p>
        </div>
    `;
    
    // Scroll to results
    trackingResult.scrollIntoView({ behavior: 'smooth' });
    
    try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const trackingData = mockTrackingData[trackingNumber];
        
        if (!trackingData) {
            throw new Error('No tracking information found for this number. Please check and try again.');
        }
        
        renderTrackingInfo(trackingData);
        showAlert(`Tracking information loaded for ${trackingNumber}`, 'success');
        
    } catch (error) {
        console.error('Tracking error:', error);
        trackingResult.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${error.message || 'Failed to fetch tracking information. Please try again later.'}
            </div>
        `;
        showAlert(error.message || 'Failed to fetch tracking information', 'danger');
    }
}

// Render tracking information
function renderTrackingInfo(trackingInfo) {
    const trackingResult = document.getElementById('tracking-result');
    if (!trackingResult) return;

    // Clear previous results
    trackingResult.innerHTML = '';
    
    const status = statusConfig[trackingInfo.status] || statusConfig.pending;
    
    // Create tracking card HTML
    trackingResult.innerHTML = `
        <div class="tracking-card">
            <div class="tracking-header">
                <h4>Tracking #${trackingInfo.trackingNumber}</h4>
                <div class="status-badge ${status.class} fw-bold">
                    <i class="fas fa-${status.icon} me-2"></i>${status.label}
                </div>
            </div>
            
            <div class="tracking-timeline">
                ${renderTimeline(trackingInfo.timeline, trackingInfo.status)}
            </div>
            
            <div class="tracking-updates">
                <h5>Shipment Details</h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Origin:</strong> ${trackingInfo.origin}</p>
                        <p class="mb-1"><strong>Destination:</strong> ${trackingInfo.destination}</p>
                        <p class="mb-1"><strong>Weight:</strong> ${trackingInfo.weight}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Service:</strong> ${trackingInfo.service}</p>
                        <p class="mb-1"><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery}</p>
                        <p class="mb-1"><strong>Dimensions:</strong> ${trackingInfo.dimensions}</p>
                    </div>
                </div>
            </div>
            
            <div class="tracking-actions">
                <button class="btn btn-outline-primary" onclick="window.print()">
                    <i class="fas fa-print me-2"></i>Print
                </button>
                <button class="btn btn-primary" id="refresh-tracking">
                    <i class="fas fa-sync-alt me-2"></i>Refresh
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for refresh button
    document.getElementById('refresh-tracking')?.addEventListener('click', () => {
        trackShipment(trackingInfo.trackingNumber);
    });
}

// Header functionality
function initHeader() {
    // Add scroll event for navbar
    const header = document.querySelector('header');
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    
    // Set active nav link based on current page
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Helper function to get the base path
        const getBasePath = (path) => {
            // Remove any hash or query parameters
            path = path.split('#')[0].split('?')[0];
            // Remove trailing index.html if present
            if (path.endsWith('index.html')) {
                path = path.replace('index.html', '');
            }
            // Remove trailing slash
            return path.replace(/\/$/, '');
        };
        
        const currentBasePath = getBasePath(currentPath);
        
        navLinks.forEach(link => {
            let linkPath = link.getAttribute('href');
            // Skip if it's a hash link
            if (linkPath.startsWith('#')) return;
            
            linkPath = getBasePath(linkPath);
            
            // Check if current path matches or is a subpath of the link path
            if (currentBasePath === linkPath || 
                (currentBasePath.startsWith(linkPath) && linkPath !== '')) {
                link.classList.add('active');
                // If it's a dropdown parent, also highlight the parent
                const dropdown = link.closest('.dropdown');
                if (dropdown) {
                    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
                    if (dropdownToggle) {
                        dropdownToggle.classList.add('active');
                    }
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Handle scroll events
    function handleScroll() {
        // Add/remove scrolled class to navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if (backToTop) backToTop.classList.add('show');
        } else {
            navbar.classList.remove('scrolled');
            if (backToTop) backToTop.classList.remove('show');
        }
    }
    
    // Smooth scroll to section
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            // Skip if it's just '#' or empty
            if (href === '#' || href === '') return;
            
            // Only handle links that have a hash and are on the same page
            if (href.includes('#')) {
                const [path, hash] = href.split('#');
                // If there's a path part and it's not the current page, let the link work normally
                if (path && path !== '' && path !== window.location.pathname) {
                    return;
                }
                
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetElement = document.getElementById(hash);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 's'
                        });
                        
                        // Update URL without page reload
                        history.pushState(null, '', `#${hash}`);
                        
                        // Close mobile menu if open
                        const navbarCollapse = document.querySelector('.navbar-collapse');
                        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
                            bsCollapse.hide();
                        }
                    }
                });
            }
        });
    }
    
    // Initialize event listeners
    function initEventListeners() {
        window.addEventListener('scroll', handleScroll);
        
        // Handle dropdown hover on desktop
        const dropdowns = document.querySelectorAll('.dropdown');
        if (window.innerWidth >= 992) {
            dropdowns.forEach(dropdown => {
                dropdown.addEventListener('mouseenter', function() {
                    this.classList.add('show');
                    this.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                    this.querySelector('.dropdown-menu').classList.add('show');
                });
                
                dropdown.addEventListener('mouseleave', function() {
                    this.classList.remove('show');
                    this.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                    this.querySelector('.dropdown-menu').classList.remove('show');
                });
            });
        }
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Re-initialize dropdowns on resize
                initDropdowns();
            }, 250);
        });
    }
    
    // Initialize dropdowns based on screen size
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        if (window.innerWidth < 992) {
            dropdowns.forEach(dropdown => {
                dropdown.removeEventListener('mouseenter', handleDropdownHover);
                dropdown.removeEventListener('mouseleave', handleDropdownLeave);
            });
        }
    }
    
    // Initialize everything
    function init() {
        setActiveNavLink();
        handleScroll(); // Set initial state
        initSmoothScroll();
        initEventListeners();
        initDropdowns();
    }
    
    init();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header functionality
    initHeader();
    
    // Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (hamburger && navLinks) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                }
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Initialize tracking form
    const trackingForm = document.getElementById('tracking-form');
    const trackingNumberInput = document.getElementById('tracking-number');
    
    if (trackingForm && trackingNumberInput) {
        trackingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const trackingNumber = trackingNumberInput.value.trim();
            
            if (!trackingNumber) {
                showAlert('Please enter a tracking number', 'warning');
                trackingNumberInput.focus();
                return;
            }
            
            trackShipment(trackingNumber);
        });
    }
    
    // Listen for real-time updates from server
    socket.on('tracking_update', (data) => {
        const currentTrackingNumber = document.getElementById('tracking-number')?.value.trim();
        if (currentTrackingNumber && data.trackingNumber === currentTrackingNumber) {
            showAlert(`Update for ${data.trackingNumber}: ${data.status} - ${data.message}`, 'info');
            trackShipment(currentTrackingNumber);
        }
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Animate numbers in stats section
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = document.querySelectorAll('.counter');
                    const speed = 200;
                    
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const increment = target / speed;
                        
                        if (count < target) {
                            counter.innerText = Math.ceil(count + increment);
                            setTimeout(updateCount, 1);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                        
                        function updateCount() {
                            const count = +counter.innerText.replace(/,/g, '');
                            if (count < target) {
                                counter.innerText = Math.ceil(count + increment).toLocaleString();
                                setTimeout(updateCount, 1);
                            } else {
                                counter.innerText = target.toLocaleString();
                            }
                        }
                    });
                    
                    // Stop observing after animation
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
});
