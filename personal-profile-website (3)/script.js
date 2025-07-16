// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  initializeFormValidation()
  initializeMobileMenu()
  initializeAnimations()
})

// Navigation Functions
function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const sections = document.querySelectorAll(".section")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      showSection(targetId)
      setActiveNavLink(this)
    })
  })

  // Show home section by default
  showSection("home")
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".section")
  sections.forEach((section) => {
    section.classList.remove("active")
  })

  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.add("active")
    targetSection.classList.add("fade-in")
  }
}

function setActiveNavLink(activeLink) {
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.classList.remove("active")
  })
  activeLink.classList.add("active")
}

function scrollToSection(sectionId) {
  showSection(sectionId)
  const navLink = document.querySelector(`a[href="#${sectionId}"]`)
  if (navLink) {
    setActiveNavLink(navLink)
  }
}

// Mobile Menu Functions
function initializeMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-menu-toggle")
  const navigation = document.querySelector(".navigation")

  if (mobileToggle) {
    mobileToggle.addEventListener("click", function () {
      navigation.classList.toggle("mobile-active")
      this.classList.toggle("active")
    })
  }
}

// Form Validation Functions
function initializeFormValidation() {
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit)

    // Real-time validation
    const inputs = contactForm.querySelectorAll("input, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateField(this)
      })

      input.addEventListener("input", function () {
        clearError(this)
      })
    })
  }
}

function handleFormSubmit(e) {
  e.preventDefault()

  const form = e.target
  const formData = new FormData(form)

  // Client-side validation
  if (!validateForm(form)) {
    return false
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]')
  const originalText = submitButton.textContent
  submitButton.innerHTML = '<span class="spinner"></span>Sending...'
  submitButton.disabled = true

  // Submit form via AJAX
  fetch("process_contact.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccessMessage("Message sent successfully! Thank you for contacting me.")
        form.reset()
      } else {
        showErrorMessage(data.message || "An error occurred. Please try again.")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showErrorMessage("An error occurred. Please try again.")
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalText
      submitButton.disabled = false
    })
}

function validateForm(form) {
  let isValid = true
  const requiredFields = form.querySelectorAll("[required]")

  requiredFields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

function validateField(field) {
  const value = field.value.trim()
  const fieldName = field.name
  let isValid = true
  let errorMessage = ""

  // Clear previous errors
  clearError(field)

  // Required field validation
  if (field.hasAttribute("required") && !value) {
    errorMessage = `${getFieldLabel(fieldName)} is required.`
    isValid = false
  }

  // Specific field validations
  if (value && isValid) {
    switch (fieldName) {
      case "name":
        if (value.length < 2) {
          errorMessage = "Name must be at least 2 characters long."
          isValid = false
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errorMessage = "Name can only contain letters and spaces."
          isValid = false
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errorMessage = "Please enter a valid email address."
          isValid = false
        }
        break

      case "phone":
        if (value && !/^[+]?[0-9\s\-$$$$]+$/.test(value)) {
          errorMessage = "Please enter a valid phone number."
          isValid = false
        }
        break

      case "subject":
        if (value.length < 5) {
          errorMessage = "Subject must be at least 5 characters long."
          isValid = false
        }
        break

      case "message":
        if (value.length < 10) {
          errorMessage = "Message must be at least 10 characters long."
          isValid = false
        }
        break
    }
  }

  if (!isValid) {
    showFieldError(field, errorMessage)
  }

  return isValid
}

function showFieldError(field, message) {
  field.classList.add("error")
  const errorElement = document.getElementById(`${field.name}-error`)
  if (errorElement) {
    errorElement.textContent = message
  }
}

function clearError(field) {
  field.classList.remove("error")
  const errorElement = document.getElementById(`${field.name}-error`)
  if (errorElement) {
    errorElement.textContent = ""
  }
}

function getFieldLabel(fieldName) {
  const labels = {
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
  }
  return labels[fieldName] || fieldName
}

function showSuccessMessage(message) {
  const form = document.getElementById("contactForm")
  const existingMessage = form.querySelector(".success-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  const successDiv = document.createElement("div")
  successDiv.className = "success-message"
  successDiv.textContent = message
  form.insertBefore(successDiv, form.firstChild)

  // Remove message after 5 seconds
  setTimeout(() => {
    successDiv.remove()
  }, 5000)
}

function showErrorMessage(message) {
  const form = document.getElementById("contactForm")
  const existingMessage = form.querySelector(".error-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.style.background = "#f8d7da"
  errorDiv.style.color = "#721c24"
  errorDiv.style.padding = "1rem"
  errorDiv.style.borderRadius = "6px"
  errorDiv.style.marginBottom = "1rem"
  errorDiv.style.border = "1px solid #f5c6cb"
  errorDiv.textContent = message
  form.insertBefore(errorDiv, form.firstChild)

  // Remove message after 5 seconds
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

// Animation Functions
function initializeAnimations() {
  // Animate elements when they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
      }
    })
  }, observerOptions)

  // Observe portfolio items
  const portfolioItems = document.querySelectorAll(".portfolio-item")
  portfolioItems.forEach((item) => {
    observer.observe(item)
  })

  // Observe skill categories
  const skillCategories = document.querySelectorAll(".skill-category")
  skillCategories.forEach((category) => {
    observer.observe(category)
  })
}

// Utility Functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Smooth scrolling for anchor links
function smoothScroll(target) {
  const element = document.querySelector(target)
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// Profile image upload functionality (optional)
function initializeImageUpload() {
  const profileImg = document.getElementById("profile-img")
  if (profileImg) {
    profileImg.addEventListener("click", () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            profileImg.src = e.target.result
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    })
  }
}

// Initialize additional features
document.addEventListener("DOMContentLoaded", () => {
  initializeImageUpload()
})

// Export functions for global access
window.scrollToSection = scrollToSection
window.showSection = showSection
