/**
 * Loads header and footer components consistently across all pages
 */

// Function to load a component
async function loadComponent(elementId, path) {
    try {
        console.log(`Loading component: ${path}`);
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error(`Element with ID '${elementId}' not found`);
            return;
        }
        
        // Add loading class
        element.classList.add('loading');
        
        // Try with relative path first
        let response = await fetch(path);
        
        // If not found, try with absolute path
        if (!response.ok) {
            console.log(`Trying with absolute path: /kgl-delivery-website${path}`);
            response = await fetch(`/kgl-delivery-website${path}`);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        element.innerHTML = html;
        console.log(`Component loaded: ${path}`);
        
        // Initialize component if function exists
        const initFunction = window[`initialize${elementId.replace(/-/g, '').replace(/^(.)/, (_, c) => c.toUpperCase())}`];
        if (typeof initFunction === 'function') {
            initFunction();
        }
        
        // Remove loading class
        element.classList.remove('loading');
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<!-- Error loading ${path} -->`;
            element.classList.add('error');
        }
    }
}

// Initialize header functionality
function initializeHeader() {
    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }
}

// Initialize footer functionality
function initializeFooter() {
    // Add current year to copyright
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    loadComponent('header-component', '/components/header.html');
    
    // Load footer
    loadComponent('footer-component', '/components/footer.html');
});
