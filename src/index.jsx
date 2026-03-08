import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FluidCursor from './components/FluidCursor.jsx'

gsap.registerPlugin(ScrollTrigger)

// Custom easing functions like Jopecuro site
const customEase = {
    smooth: 'power4.out',
    elastic: 'elastic.out(1, 0.5)',
    bounce: 'back.out(1.7)',
    expo: 'expo.out',
    snappy: 'power3.inOut'
}

// Split text into words/lines for animation
function SplitText({ children, className, type = 'words' }) {
    if (type === 'words') {
        const words = children.split(' ')
        return (
            <span className={`split-text ${className || ''}`}>
                {words.map((word, i) => (
                    <span key={i} className="word-wrapper">
                        <span className="word">{word}</span>
                        {i < words.length - 1 && '\u00A0'}
                    </span>
                ))}
            </span>
        )
    }
    return <span className={className}>{children}</span>
}

// Text animation component - letters animate on hover
function AnimatedText({ children, className }) {
    const letters = children.split('')
    return (
        <span className={`animated-text ${className || ''}`}>
            {letters.map((letter, i) => (
                <span
                    key={i}
                    className="letter"
                    style={{ transitionDelay: `${i * 0.02}s` }}
                >
                    {letter === ' ' ? '\u00A0' : letter}
                </span>
            ))}
        </span>
    )
}

// Image with reveal animation
function RevealImage({ src, alt, className }) {
    return (
        <div className={`reveal-image-wrapper ${className || ''}`}>
            <div className="reveal-mask"></div>
            <img src={src} alt={alt} className="reveal-img" />
        </div>
    )
}

// Main App component with Lenis
function App() {
    const containerRef = useRef(null)
    const curtainRef = useRef(null)
    const horizontalRef = useRef(null)
    const lenisRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // ============ INTRO ANIMATION ============
        const introTl = gsap.timeline({
            onComplete: () => setIsLoaded(true)
        })

        // Animate intro curtain with text reveal
        introTl
            .set('.intro-overlay', { y: '0%' })
            .to('.intro-name .char', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.03,
                ease: customEase.smooth,
                delay: 0.3
            })
            .to('.intro-title', {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: customEase.smooth
            }, '-=0.4')
            .to('.intro-line', {
                scaleX: 1,
                duration: 0.8,
                ease: customEase.expo
            }, '-=0.3')
            .to('.intro-overlay', {
                y: '-100%',
                duration: 1,
                ease: 'power4.inOut',
                delay: 0.5
            })
            .from('.nav-container', {
                y: -100,
                opacity: 0,
                duration: 0.8,
                ease: customEase.smooth
            }, '-=0.5')
            .from('.hero-content > *', {
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: customEase.smooth
            }, '-=0.6')
            .from('.hero-stats', {
                y: 40,
                opacity: 0,
                duration: 0.6,
                ease: customEase.smooth
            }, '-=0.4')
            .from('.scroll-indicator', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                ease: customEase.smooth
            }, '-=0.2')

        // Initialize Lenis smooth scroll
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
        })
        lenisRef.current = lenis

        // Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update)

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        // ============ MAGNETIC BUTTON EFFECT ============
        const magneticBtns = document.querySelectorAll('.magnetic-btn')
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect()
                const x = e.clientX - rect.left - rect.width / 2
                const y = e.clientY - rect.top - rect.height / 2
                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                })
            })
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: customEase.elastic
                })
            })
        })

        // Curtain page transition effect
        const handleNavClick = (e) => {
            const target = e.target.closest('a[href^="#"]')
            if (!target) return

            e.preventDefault()
            const href = target.getAttribute('href')
            const targetEl = document.querySelector(href)
            if (!targetEl) return

            const curtain = curtainRef.current
            if (!curtain) {
                lenis.scrollTo(targetEl)
                return
            }

            // Animate curtain in, scroll, then animate out
            const tl = gsap.timeline()
            tl.to(curtain, {
                y: '0%',
                duration: 0.5,
                ease: 'power4.inOut'
            })
            .to('.curtain-text', {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: customEase.smooth
            }, '-=0.2')
            .add(() => {
                lenis.scrollTo(targetEl, { immediate: true })
            })
            .to('.curtain-text', {
                y: 20,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in'
            })
            .to(curtain, {
                y: '100%',
                duration: 0.5,
                ease: 'power4.inOut'
            }, '-=0.1')
            .set(curtain, { y: '-100%' })
            .set('.curtain-text', { y: -20, opacity: 0 })
        }

        document.addEventListener('click', handleNavClick)

        // ============ SCROLL-TRIGGERED ANIMATIONS ============

        // Animate sections with staggered reveal
        const sections = document.querySelectorAll('.animate-section')
        sections.forEach((section) => {
            const items = section.querySelectorAll('.animate-item')

            gsap.fromTo(items,
                {
                    y: 80,
                    opacity: 0,
                    scale: 0.95
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    stagger: 0.12,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                }
            )
        })

        // Expertise cards with hover scale effect
        gsap.utils.toArray('.expertise-card').forEach(card => {
            gsap.fromTo(card,
                { y: 100, opacity: 0, rotateY: -15 },
                {
                    y: 0,
                    opacity: 1,
                    rotateY: 0,
                    duration: 1,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%'
                    }
                }
            )
        })

        // Achievement cards with staggered entrance
        gsap.utils.toArray('.achievement-card').forEach((card, i) => {
            gsap.fromTo(card,
                { x: i % 2 === 0 ? -100 : 100, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%'
                    }
                }
            )
        })

        // Parallax effect for images - more pronounced
        gsap.utils.toArray('.parallax-img').forEach(img => {
            gsap.to(img, {
                yPercent: -30,
                scale: 1.1,
                ease: 'none',
                scrollTrigger: {
                    trigger: img,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            })
        })

        // Section title reveal with mask animation
        gsap.utils.toArray('.section-title').forEach(title => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%'
                }
            })

            tl.fromTo(title,
                {
                    clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
                    opacity: 0
                },
                {
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power4.inOut'
                }
            )
        })

        // Section labels slide in
        gsap.utils.toArray('.section-label').forEach(label => {
            gsap.fromTo(label,
                { x: -50, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: label,
                        start: 'top 90%'
                    }
                }
            )
        })

        // Publication items slide in from right
        gsap.utils.toArray('.publication-item').forEach((item, i) => {
            gsap.fromTo(item,
                { x: 100, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 90%'
                    }
                }
            )
        })

        // ============ HORIZONTAL SCROLL SECTION (Desktop only) ============
        const horizontalSection = horizontalRef.current
        if (horizontalSection && window.innerWidth > 768) {
            const panels = gsap.utils.toArray('.horizontal-panel')

            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.horizontal-wrapper',
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => '+=' + (horizontalSection.offsetWidth - window.innerWidth),
                    invalidateOnRefresh: true
                }
            })
        }

        // ============ IMAGE REVEAL ANIMATIONS ============
        gsap.utils.toArray('.reveal-image-wrapper').forEach(wrapper => {
            const mask = wrapper.querySelector('.reveal-mask')
            const img = wrapper.querySelector('.reveal-img')

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 80%'
                }
            })

            tl.to(mask, {
                scaleX: 0,
                duration: 1.2,
                ease: 'power4.inOut',
                transformOrigin: 'right center'
            })
            .from(img, {
                scale: 1.3,
                duration: 1.4,
                ease: 'power3.out'
            }, 0)
        })

        // ============ WORD REVEAL ANIMATIONS ============
        gsap.utils.toArray('.split-text').forEach(text => {
            const words = text.querySelectorAll('.word')
            gsap.fromTo(words,
                { y: '100%', opacity: 0 },
                {
                    y: '0%',
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: customEase.smooth,
                    scrollTrigger: {
                        trigger: text,
                        start: 'top 85%'
                    }
                }
            )
        })

        // ============ FLOATING ELEMENTS ============
        gsap.utils.toArray('.float-element').forEach((el, i) => {
            gsap.to(el, {
                y: 'random(-20, 20)',
                rotation: 'random(-5, 5)',
                duration: 'random(3, 5)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.2
            })
        })

        // Counter animation for stats
        const animateCounter = (el, delay = 0) => {
            const target = parseInt(el.dataset.target || el.textContent)
            el.textContent = '0'  // Start at 0

            // Check if element is in viewport
            const rect = el.getBoundingClientRect()
            const inView = rect.top < window.innerHeight && rect.bottom > 0

            if (inView) {
                // Animate immediately with delay for hero counters
                gsap.to(el, {
                    textContent: target,
                    duration: 2,
                    delay: delay + 1.5, // Wait for intro animation
                    ease: 'power2.out',
                    snap: { textContent: 1 }
                })
            } else {
                // Use ScrollTrigger for counters below the fold
                gsap.to(el, {
                    textContent: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                })
            }
        }

        document.querySelectorAll('.counter').forEach((el, i) => animateCounter(el, i * 0.2))

        // Cleanup
        return () => {
            document.removeEventListener('click', handleNavClick)
            lenis.destroy()
            ScrollTrigger.getAll().forEach(st => st.kill())
        }
    }, [])

    return (
        <div ref={containerRef} className={isLoaded ? 'loaded' : ''}>
            {/* WebGL Fluid Cursor Effect */}
            <FluidCursor />

            {/* Intro Overlay Animation */}
            <div className="intro-overlay">
                <div className="intro-content">
                    <h1 className="intro-name">
                        {'Dr. Sundeep Mishra'.split('').map((char, i) => (
                            <span key={i} className="char" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h1>
                    <div className="intro-line"></div>
                    <p className="intro-title">Vice-Chancellor & Interventional Cardiologist</p>
                </div>
            </div>

            {/* Transition Curtain */}
            <div className="transition-curtain" ref={curtainRef}>
                <span className="curtain-text">Dr. Sundeep Mishra</span>
            </div>

            {/* Navigation */}
            <nav className="nav-container">
                <a href="/" className="nav-logo">
                    <AnimatedText>Dr. Sundeep Mishra</AnimatedText>
                </a>
                <div className="nav-links">
                    <a href="#about" className="nav-link"><AnimatedText>About</AnimatedText></a>
                    <a href="#social-services" className="nav-link"><AnimatedText>Social Work</AnimatedText></a>
                    <a href="#international" className="nav-link"><AnimatedText>International</AnimatedText></a>
                    <a href="#achievements" className="nav-link"><AnimatedText>Awards</AnimatedText></a>
                    <a href="#contact" className="nav-link"><AnimatedText>Contact</AnimatedText></a>
                </div>
                <a href="#contact" className="nav-cta">Book Appointment</a>
            </nav>

            {/* HERO SECTION */}
            <section className="hero-section" id="home">
                {/* Shimmer effect overlay */}
                <div className="shimmer-overlay"></div>

                {/* 3D WebGL Canvas */}
                <div className='webgl-container'>
                    <Canvas
                        camera={{
                            fov: 45,
                            near: 1,
                            far: 100,
                            position: [0, 0, 10]
                        }}
                        gl={{
                            antialias: true,
                            alpha: true,
                            powerPreference: 'high-performance'
                        }}
                        flat={true}
                    >
                        <Experience />
                    </Canvas>
                </div>

                {/* Hero Overlay */}
                <div className="hero-overlay">
                    <div className="hero-content">
                        <p className="hero-subtitle animate-item">Vice-Chancellor, NIMS University & Director, NIMS Heart & Brain Hospital</p>
                        <h1 className="hero-title">
                            <span className="title-line animate-item">Prof. (Dr.) Sundeep</span>
                            <span className="title-line highlight animate-item">Mishra</span>
                        </h1>
                        <div className="hero-credentials animate-item">
                            <span className="credential-badge">MBBS, MD, DM (AIIMS)</span>
                            <span className="credential-badge">Fellowship USA</span>
                            <span className="credential-badge">FACC</span>
                            <span className="credential-badge">FSCAI</span>
                        </div>
                        <p className="hero-description animate-item">
                            One of India's top interventional cardiologists with over 32 years
                            of clinical experience. First to perform Virtual Histology procedures
                            in India. Editor-in-Chief, Indian Heart Journal.
                        </p>
                        <div className="hero-cta animate-item">
                            <a href="#contact" className="btn btn-primary magnetic-btn">
                                <span>Book Appointment</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                            <a href="#about" className="btn btn-secondary magnetic-btn">
                                <span>Learn More</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="hero-stats">
                    <div className="stat-item">
                        <div className="stat-number"><span className="counter" data-target="32">32</span>+</div>
                        <div className="stat-label">Years Experience</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number"><span className="counter" data-target="200">200</span>+</div>
                        <div className="stat-label">Publications</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number"><span className="counter" data-target="50">50</span>K+</div>
                        <div className="stat-label">Procedures</div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <span className="scroll-text">Scroll</span>
                    <div className="scroll-line"></div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section className="about-section animate-section" id="about">
                <div className="section-container">
                    <div className="about-grid">
                        <div className="about-content">
                            <p className="section-label animate-item">About</p>
                            <h2 className="section-title animate-item">
                                A Legacy of<br />
                                <span className="highlight">Excellence</span>
                            </h2>
                            <p className="about-text animate-item">
                                Prof. (Dr.) Sundeep Mishra serves as Vice-Chancellor and President
                                of NIMS University Rajasthan Jaipur, and Director of NIMS Heart &
                                Brain Hospital. Recognized as one of India's top interventional
                                cardiologists with over 32 years of clinical experience.
                            </p>
                            <p className="about-text animate-item">
                                He was the first to perform Virtual Histology procedures in India.
                                As Editor-in-Chief of Indian Heart Journal and Chairman of National
                                Intervention Council, he continues to shape cardiac care nationally
                                and internationally.
                            </p>
                            <div className="about-highlights">
                                <div className="highlight-item animate-item">
                                    <div className="highlight-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                    </div>
                                    <span>DM Cardiology - AIIMS New Delhi</span>
                                </div>
                                <div className="highlight-item animate-item">
                                    <div className="highlight-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                    </div>
                                    <span>Fellowship - Washington Hospital Center, USA</span>
                                </div>
                                <div className="highlight-item animate-item">
                                    <div className="highlight-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                    </div>
                                    <span>Board of Trustees - SCAI, USA</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-image animate-item">
                            <RevealImage
                                src="./images/doctor-about.png"
                                alt="Dr. Sundeep Mishra"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* HORIZONTAL SCROLL CARDS SECTION */}
            <div className="horizontal-wrapper">
                <section className="horizontal-section" ref={horizontalRef}>
                    <div className="horizontal-container">
                        <div className="horizontal-panel panel-intro">
                            <div className="panel-content">
                                <span className="panel-number">01 / 03</span>
                                <h2 className="panel-title">A Journey of<br/>Excellence</h2>
                                <p className="panel-text">
                                    From AIIMS New Delhi to Washington Hospital Center,
                                    a career dedicated to saving lives and advancing
                                    cardiac care globally.
                                </p>
                            </div>
                            <div className="panel-visual panel-image">
                                <img src="./images/journey-casual.png" alt="Dr. Mishra - A Journey of Excellence" />
                            </div>
                        </div>
                        <div className="horizontal-panel panel-accent">
                            <div className="panel-content">
                                <span className="panel-number">02 / 03</span>
                                <h2 className="panel-title">First in<br/>India</h2>
                                <p className="panel-text">
                                    Pioneer in Virtual Histology procedures. Setting new
                                    standards in interventional cardiology with innovative
                                    techniques and patient care.
                                </p>
                            </div>
                            <div className="panel-visual panel-image">
                                <img src="./images/first-india-cathlab.png" alt="Dr. Mishra performing cardiac procedure" />
                            </div>
                        </div>
                        <div className="horizontal-panel">
                            <div className="panel-content">
                                <span className="panel-number">03 / 03</span>
                                <h2 className="panel-title">Global<br/>Leadership</h2>
                                <p className="panel-text">
                                    Board of Trustees at SCAI USA. Editor-in-Chief,
                                    Indian Heart Journal. Shaping the future of
                                    cardiology worldwide.
                                </p>
                            </div>
                            <div className="panel-visual">
                                <div className="panel-shape shape-4 float-element"></div>
                                <div className="panel-shape shape-5 float-element"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* EDUCATION SECTION */}
            <section className="education-section animate-section" id="education">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Credentials</p>
                        <h2 className="section-title animate-item">
                            Education &<br />
                            <span className="highlight">Training</span>
                        </h2>
                    </div>
                    <div className="education-grid">
                        <div className="education-card animate-item">
                            <div className="edu-year">MBBS</div>
                            <h3>SMS Medical College</h3>
                            <p>Jaipur, Rajasthan</p>
                        </div>
                        <div className="education-card animate-item">
                            <div className="edu-year">MD</div>
                            <h3>University of Delhi</h3>
                            <p>Medicine</p>
                        </div>
                        <div className="education-card animate-item">
                            <div className="edu-year">DM</div>
                            <h3>AIIMS, New Delhi</h3>
                            <p>Cardiology</p>
                        </div>
                        <div className="education-card animate-item">
                            <div className="edu-year">Fellowship</div>
                            <h3>Washington Hospital Center</h3>
                            <p>Interventional Cardiology, USA</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* LEADERSHIP ROLES SECTION */}
            <section className="leadership-section animate-section">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Leadership</p>
                        <h2 className="section-title animate-item">
                            Professional<br />
                            <span className="highlight">Roles</span>
                        </h2>
                    </div>
                    <div className="leadership-grid">
                        <div className="leadership-card animate-item">
                            <span className="role-number">01</span>
                            <h3>Vice-Chancellor & President</h3>
                            <p>NIMS University Rajasthan, Jaipur</p>
                        </div>
                        <div className="leadership-card animate-item">
                            <span className="role-number">02</span>
                            <h3>Editor-in-Chief</h3>
                            <p>Indian Heart Journal</p>
                        </div>
                        <div className="leadership-card animate-item">
                            <span className="role-number">03</span>
                            <h3>Chairman</h3>
                            <p>National Intervention Council, India</p>
                        </div>
                        <div className="leadership-card animate-item">
                            <span className="role-number">04</span>
                            <h3>Board of Trustees</h3>
                            <p>SCAI, USA</p>
                        </div>
                        <div className="leadership-card animate-item">
                            <span className="role-number">05</span>
                            <h3>Course Director</h3>
                            <p>TCT India & Sri Lanka Interventional Meeting</p>
                        </div>
                        <div className="leadership-card animate-item">
                            <span className="role-number">06</span>
                            <h3>International Editor</h3>
                            <p>Sri Lanka Journal of Cardiology</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* EXPERTISE SECTION */}
            <section className="expertise-section animate-section" id="expertise">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Expertise</p>
                        <h2 className="section-title animate-item">
                            Areas of<br />
                            <span className="highlight">Specialization</span>
                        </h2>
                    </div>
                    <div className="expertise-featured animate-item">
                        <img src="./images/specialization-procedure.png" alt="Dr. Mishra performing specialized cardiac procedure" />
                    </div>
                    <div className="expertise-grid">
                        <div className="expertise-card animate-item">
                            <div className="card-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 5.006a5 5 0 1 1 7.5 7.566z"/>
                                </svg>
                            </div>
                            <h3>Interventional Cardiology</h3>
                            <p>Complex coronary interventions, angioplasty, and stenting procedures with cutting-edge techniques.</p>
                        </div>
                        <div className="expertise-card animate-item">
                            <div className="card-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <h3>Preventive Cardiology</h3>
                            <p>Comprehensive heart disease prevention programs and risk factor management.</p>
                        </div>
                        <div className="expertise-card animate-item">
                            <div className="card-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M4.5 12.75l6 6 9-13.5"/>
                                </svg>
                            </div>
                            <h3>Cardiac Imaging</h3>
                            <p>Advanced echocardiography, CT angiography, and diagnostic cardiac procedures.</p>
                        </div>
                        <div className="expertise-card animate-item">
                            <div className="card-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path d="M12 14v7"/>
                                </svg>
                            </div>
                            <h3>Medical Education</h3>
                            <p>Training future cardiologists and leading medical curriculum development.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL SERVICES SECTION */}
            <section className="social-section animate-section" id="social-services">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Humanitarian</p>
                        <h2 className="section-title animate-item">
                            Social<br />
                            <span className="highlight">Services</span>
                        </h2>
                    </div>
                    <div className="social-grid">
                        <div className="social-card with-image large animate-item">
                            <div className="social-card-image">
                                <img src="./images/social-ladakh.png" alt="Dr. Mishra in Ladakh with Buddhist monk" />
                            </div>
                            <div className="social-card-content">
                                <h3>Ladakh Heart Foundation</h3>
                                <p>Delivered cardiac care to isolated high-altitude communities. Successfully performed cardiac surgeries at 11,400 feet elevation in Leh, Ladakh - pioneering high-altitude cardiac procedures.</p>
                            </div>
                        </div>
                        <div className="social-card with-image animate-item">
                            <div className="social-card-image">
                                <img src="./images/social-surgery.png" alt="Dr. Mishra performing surgery" />
                            </div>
                            <div className="social-card-content">
                                <h3>Nepal Cath Lab</h3>
                                <p>Established first catheterization laboratory in Nepal's public sector at Shahid Ganga Ram Hospital.</p>
                            </div>
                        </div>
                        <div className="social-card animate-item">
                            <div className="social-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                            </div>
                            <h3>Kargil War Relief</h3>
                            <p>Provided medical assistance to affected populations in conflict zones following the Kargil War.</p>
                        </div>
                        <div className="social-card animate-item">
                            <div className="social-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <h3>Rural Outreach</h3>
                            <p>Extended cardiac care across Mathura, Patna, Bilaspur, and Mahasamund, addressing health disparities.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERNATIONAL SECTION */}
            <section className="international-section animate-section" id="international">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Global Impact</p>
                        <h2 className="section-title animate-item">
                            International<br />
                            <span className="highlight">Leadership</span>
                        </h2>
                    </div>
                    <div className="international-gallery animate-item">
                        <div className="gallery-item">
                            <img src="./images/international-conference.png" alt="Dr. Mishra at international imaging conference" />
                            <span className="gallery-caption">Imaging Conference Faculty</span>
                        </div>
                        <div className="gallery-item">
                            <img src="./images/international-faculty.png" alt="Dr. Mishra with international colleague" />
                            <span className="gallery-caption">Global Faculty Exchange</span>
                        </div>
                        <div className="gallery-item">
                            <img src="./images/international-nigeria.png" alt="Dr. Mishra at Nigeria Business Council" />
                            <span className="gallery-caption">Nigeria Healthcare Summit</span>
                        </div>
                        <div className="gallery-item">
                            <img src="./images/leadership-csitv.png" alt="Dr. Mishra on CSI TV" />
                            <span className="gallery-caption">CSI TV Medical Education</span>
                        </div>
                    </div>
                    <div className="international-content">
                        <div className="international-roles animate-item">
                            <h3>Course Directorships</h3>
                            <ul>
                                <li>National Course Director - ACC National Talent Hunt Program</li>
                                <li>Course Director - Sri Lanka Interventional Meeting, Colombo</li>
                                <li>Co-Course Chairman - C3 Orlando, USA</li>
                                <li>Course Director - TCT India</li>
                                <li>Session Coordinator - IAGS 2024</li>
                            </ul>
                        </div>
                        <div className="international-events animate-item">
                            <h3>Global Conferences</h3>
                            <div className="event-tags">
                                <span className="event-tag">EuroPCR Paris</span>
                                <span className="event-tag">SOLACI Mexico</span>
                                <span className="event-tag">GulfPCR Dubai</span>
                                <span className="event-tag">TCTAP Seoul</span>
                                <span className="event-tag">CardioAlex Egypt</span>
                                <span className="event-tag">ACC Washington</span>
                            </div>
                        </div>
                        <div className="international-trials animate-item">
                            <h3>Clinical Trials</h3>
                            <ul>
                                <li>SPIRIT V - Multinational stent study</li>
                                <li>ATLAS ACS 2 TIMI 51 - Anticoagulant research</li>
                                <li>INDICOR Study - Drug-eluting balloon trial</li>
                                <li>Terumo e-Monitor - Fastest global enrollment</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ACHIEVEMENTS SECTION */}
            <section className="achievements-section animate-section" id="achievements">
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-label animate-item">Recognition</p>
                        <h2 className="section-title animate-item">
                            Awards &<br />
                            <span className="highlight">Achievements</span>
                        </h2>
                    </div>
                    <div className="achievements-grid">
                        <div className="achievement-card featured animate-item">
                            <div className="achievement-year">2024</div>
                            <h3>Education Excellence Award</h3>
                            <p>COER University - Recognition for outstanding contribution to medical education.</p>
                        </div>
                        <div className="achievement-card animate-item">
                            <div className="achievement-year">2023</div>
                            <h3>Distinguished Alumni Award</h3>
                            <p>SMS Medical College, Jaipur - Honoring exceptional career achievements.</p>
                        </div>
                        <div className="achievement-card animate-item">
                            <div className="achievement-year">2023</div>
                            <h3>Best Vice Chancellor</h3>
                            <p>Center for Education Growth and Research - Leadership excellence.</p>
                        </div>
                        <div className="achievement-card animate-item">
                            <div className="achievement-year">2022</div>
                            <h3>Visionary Leader of the Year</h3>
                            <p>Recognition for exceptional leadership in healthcare and medical education.</p>
                        </div>
                        <div className="achievement-card animate-item">
                            <div className="achievement-year">2016</div>
                            <h3>Best Academician Award</h3>
                            <p>CSI Chennai Chapter - Excellence in medical education.</p>
                        </div>
                        <div className="achievement-card animate-item">
                            <div className="achievement-year">2010</div>
                            <h3>Young Leader Award</h3>
                            <p>Cardiovascular Revascularization Therapeutics, Washington DC, USA.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PUBLICATIONS SECTION */}
            <section className="publications-section animate-section">
                <div className="section-container">
                    <div className="publications-content">
                        <div className="publications-info">
                            <p className="section-label animate-item">Research</p>
                            <h2 className="section-title animate-item">
                                Publications &<br />
                                <span className="highlight">Research</span>
                            </h2>
                            <p className="publications-text animate-item">
                                Dr. Mishra has authored over 500 peer-reviewed publications,
                                contributed to major cardiology textbooks, and presented at
                                prestigious international conferences worldwide.
                            </p>
                            <div className="publications-stats animate-item">
                                <div className="pub-stat">
                                    <span className="pub-number"><span className="counter" data-target="500">500</span>+</span>
                                    <span className="pub-label">Publications</span>
                                </div>
                                <div className="pub-stat">
                                    <span className="pub-number"><span className="counter" data-target="50">50</span>+</span>
                                    <span className="pub-label">Book Chapters</span>
                                </div>
                                <div className="pub-stat">
                                    <span className="pub-number"><span className="counter" data-target="100">100</span>+</span>
                                    <span className="pub-label">Conferences</span>
                                </div>
                            </div>
                        </div>
                        <div className="publications-list">
                            <div className="publication-item animate-item">
                                <span className="pub-journal">Journal of Cardiology</span>
                                <h4>Advances in Complex Coronary Interventions</h4>
                                <span className="pub-year">2024</span>
                            </div>
                            <div className="publication-item animate-item">
                                <span className="pub-journal">Indian Heart Journal</span>
                                <h4>Prevention Strategies for Cardiovascular Disease</h4>
                                <span className="pub-year">2023</span>
                            </div>
                            <div className="publication-item animate-item">
                                <span className="pub-journal">Circulation</span>
                                <h4>Novel Stenting Techniques in High-Risk Patients</h4>
                                <span className="pub-year">2023</span>
                            </div>
                            <div className="publication-item animate-item">
                                <span className="pub-journal">JACC Interventions</span>
                                <h4>Long-term Outcomes of Drug-Eluting Stents</h4>
                                <span className="pub-year">2022</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section className="contact-section animate-section" id="contact">
                <div className="section-container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <p className="section-label animate-item">Get in Touch</p>
                            <h2 className="section-title animate-item">
                                Book an<br />
                                <span className="highlight">Appointment</span>
                            </h2>
                            <p className="contact-text animate-item">
                                Schedule a consultation with Dr. Sundeep Mishra for expert
                                cardiac care and personalized treatment plans.
                            </p>
                            <div className="contact-details">
                                <div className="contact-item animate-item">
                                    <div className="contact-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Hospital</h4>
                                        <p>Ujala Cygnus Brightstar Hospital, Moradabad</p>
                                    </div>
                                </div>
                                <div className="contact-item animate-item">
                                    <div className="contact-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Phone</h4>
                                        <p>+91-9871421390 / +91-9389808073</p>
                                    </div>
                                </div>
                                <div className="contact-item animate-item">
                                    <div className="contact-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Email</h4>
                                        <p>drsundeepmishranic@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form-wrapper animate-item">
                            <form className="contact-form">
                                <div className="form-group">
                                    <input type="text" placeholder="Your Name" required />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Email Address" required />
                                </div>
                                <div className="form-group">
                                    <input type="tel" placeholder="Phone Number" required />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Your Message" rows="4"></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary btn-full magnetic-btn">
                                    <span>Request Appointment</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>Dr. Sundeep Mishra</h3>
                            <p>Vice-Chancellor & Interventional Cardiologist</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>Pages</h4>
                                <a href="#home">Home</a>
                                <a href="#about">About</a>
                                <a href="#expertise">Expertise</a>
                                <a href="#achievements">Achievements</a>
                            </div>
                            <div className="footer-col">
                                <h4>Contact</h4>
                                <a href="#contact">Book Appointment</a>
                                <a href="mailto:contact@drsundeepmishra.com">Email</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2024 Dr. Sundeep Mishra. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App />)
