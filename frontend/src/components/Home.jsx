import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Theme Management
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.add('home-page-active');
    return () => {
      document.documentElement.classList.remove('home-page-active');
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // ==========================================
  // HERO ANIMATION LOOP (Highly Interactive)
  // ==========================================
  const [heroStep, setHeroStep] = useState(0);
  const [heroTypedText, setHeroTypedText] = useState('');
  
  const fullHeroText = "Hi John,\n\nYes, we're open on Sunday and would be happy to have you visit.\n\nBest,\nTown Store";

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroStep(prev => (prev + 1) % 5);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroStep === 0) {
      setHeroTypedText('');
    } else if (heroStep === 2) {
      // Type message
      let currentLength = 0;
      const typingInterval = setInterval(() => {
        if (currentLength < fullHeroText.length) {
          setHeroTypedText(fullHeroText.slice(0, currentLength + 2));
          currentLength += 2;
        } else {
          clearInterval(typingInterval);
        }
      }, 30);
      return () => clearInterval(typingInterval);
    } else if (heroStep >= 3) {
      setHeroTypedText(fullHeroText);
    }
  }, [heroStep]);

  // ==========================================
  // MODULE 1: Try Gmail Agent (State & Content)
  // ==========================================
  const tryAgentTemplates = {
    product_order: {
      incoming: "Hey there! I ordered the custom roasted coffee beans (order #4092) last Wednesday and paid for expedited shipping. The package hasn't arrived yet and the tracking link says 'Pending'. Can you please look into this and let me know when to expect it? Thanks!",
      reply: "Hi there!\n\nThank you for reaching out, and I apologize for the delay in receiving your package (Order #4092).\n\nI have just checked with our shipping carrier. It appears there was a brief routing delay at the regional hub, but the package is now back in transit and is scheduled for delivery tomorrow by 3:00 PM.\n\nWe will refund your expedited shipping charge as a gesture of goodwill. Thank you for your patience!\n\nBest regards,\nMailJet Assistant"
    },
    helpdesk: {
      incoming: "Hi support team, I'm trying to reset my password on the billing portal but I never receive the verification code in my inbox. I've checked my spam folder as well. Can you please assist me manually or reset it from your end? Appreciate the quick help!",
      reply: "Dear Customer,\n\nThank you for contacting Support. I'm sorry to hear you are having trouble receiving the password reset code.\n\nI have verified your account and manually generated a secure, temporary password for you to log in:\n\nTemporary Password: **MJ-8924-XyZ**\n\nPlease log in using this temporary credential and immediately update your password under settings.\n\nLet us know if you encounter any further issues!\n\nBest regards,\nMailJet Assistant"
    },
    it_service: {
      incoming: "Hey, my work laptop is running extremely slow today—apps like Photoshop and Chrome are taking forever to open and freezing constantly. It's slowing down my work. Can someone from IT take a look remotely or diagnose the issue?",
      reply: "Hi Jack,\n\nThanks for letting us know. We'll run a quick diagnostics check remotely this afternoon. Please leave your laptop on and connected to the corporate network. If needed, we'll schedule a hands-on hardware check tomorrow.\n\nBest,\nMailJet IT Support"
    },
    appointment: {
      incoming: "Hi there, I have an appointment with Dr. William Darcy this Thursday at 3 PM, but I need to reschedule due to a work conflict. Do you have any availability early next week?",
      reply: "Dear Patient,\n\nThank you for reaching out. We have successfully rescheduled your appointment with Dr. William Darcy to next Monday, June 1st at 10:00 AM.\n\nPlease let us know if this time works for you or if you need to adjust it further.\n\nBest wishes,\nDr. Darcy's Office"
    }
  };

  const [activeTryTab, setActiveTryTab] = useState('appointment');
  const [tryInputText, setTryInputText] = useState(tryAgentTemplates.appointment.incoming);
  const [isTryLoading, setIsTryLoading] = useState(false);
  const [tryOutputText, setTryOutputText] = useState('');

  // Handle Try Category Switch
  const handleTryTabClick = (tab) => {
    setActiveTryTab(tab);
    setTryInputText(tryAgentTemplates[tab].incoming);
    setTryOutputText('');
  };

  // Run M1 Simulation
  const handleGenerateTryDraft = () => {
    setIsTryLoading(true);
    setTryOutputText('');
    setTimeout(() => {
      setTryOutputText(tryAgentTemplates[activeTryTab].reply);
      setIsTryLoading(false);
    }, 1500);
  };

  // ==========================================
  // MODULE 2: See MailJet in Action (Dark Simulator)
  // ==========================================
  const simulatorCategories = {
    it: {
      title: "IT customer service",
      desc: "Quickly respond to repetitive questions and focus your time on what truly matters.",
      emails: [
        {
          key: "slow",
          label: "Computer Running Slow",
          incoming: "Hey, my laptop has been super slow lately—apps take forever to open. Can someone take a look?\n\nBest,\nJack Willham",
          reply: "Hi Jack,\n\nThanks for letting us know. We'll run a quick diagnostics check remotely this afternoon. Please leave your laptop on and connected to the network. If needed, we'll schedule a hands-on hardware check tomorrow.\n\nBest,\nMailJet IT"
        },
        {
          key: "figma",
          label: "Software Installation Request",
          incoming: "Hi, I need to get the latest Figma desktop app and Adobe Creative Cloud installed on my new work laptop. Could you grant access or push the software?\n\nThanks,\nSarah",
          reply: "Hi Sarah,\n\nI have approved your software request. Figma and Adobe Creative Cloud are now available in your Company Portal app. Please open it and click 'Install' next to each application.\n\nBest regards,\nMailJet IT"
        },
        {
          key: "vpn",
          label: "VPN Connection Issue!",
          incoming: "Hello, I am trying to connect to the corporate VPN from home but I keep getting a 'Gateway Unreachable' timeout error. Is the server down?\n\nRegards,\nDavid",
          reply: "Hi David,\n\nOur VPN servers are currently online. This 'Gateway Unreachable' error usually occurs when local ISP ports are blocked or DNS is outdated. Please flush your DNS or reboot your home router. Let us know if the issue persists!\n\nBest,\nMailJet IT"
        }
      ]
    },
    healthcare: {
      title: "Healthcare service",
      desc: "Engage patients promptly with automated draft replies for appointment bookings and inquiries.",
      emails: [
        {
          key: "resched",
          label: "Reschedule Appointment",
          incoming: "Hi, I have a checkup scheduled for Wednesday at 9 AM but I need to push it back. Can we reschedule to Thursday afternoon?",
          reply: "Hello,\n\nWe can certainly reschedule your checkup. We have openings on Thursday at 2:00 PM or 4:00 PM. Please let us know which slot works best for you.\n\nBest wishes,\nMailJet Health Support"
        },
        {
          key: "refill",
          label: "Prescription Refill Request",
          incoming: "Hello, I need to request a refill for my allergy prescription (Refill ID: 90214). Can you send this to my pharmacy on Main St?",
          reply: "Hi,\n\nWe have reviewed your refill request and sent the authorization to your pharmacy on Main St. It should be ready for pickup in 2 hours.\n\nWarm regards,\nMailJet Health Support"
        }
      ]
    },
    products: {
      title: "Products order",
      desc: "Delight customers with instant support on tracking, refund requests, and product queries.",
      emails: [
        {
          key: "address",
          label: "Incorrect Shipping Address",
          incoming: "Help! I just placed an order (ID: 5543) but I entered my old apartment address. Can you update it to 123 Pine St before shipping?",
          reply: "Hello,\n\nThank you for reaching out. We have successfully updated the shipping address for your Order #5543 to 123 Pine St. Your package is scheduled to ship today!\n\nBest regards,\nMailJet Support"
        },
        {
          key: "refund",
          label: "Where is My Refund?",
          incoming: "Hi, I returned a defective item two weeks ago and the tracking shows it was delivered back to you, but I haven't seen the refund on my card yet.",
          reply: "Hi there,\n\nthank you for the update. We have processed your refund for the returned item. It should appear back in your bank account within 3-5 business days depending on your bank.\n\nSincerely,\nMailJet Support"
        }
      ]
    },
    course: {
      title: "Course helpdesk",
      desc: "Automate responses to student queries regarding syllabus, schedule updates, and assignment extensions.",
      emails: [
        {
          key: "syllabus",
          label: "Syllabus Questions",
          incoming: "Hi Professor, is the reading list for Week 4 available online, and will it be included in the midterm exam next month?",
          reply: "Hi,\n\nyes, the Week 4 reading list is available under the Resources tab in our portal. The material will indeed be covered on the midterm exam. Good luck studying!\n\nBest regards,\nCourse Support"
        },
        {
          key: "ext",
          label: "Assignment Extension Request",
          incoming: "Dear Instructor, I have been sick with the flu and was unable to complete the final project on time. Could I get a 2-day extension?",
          reply: "Hello,\n\nI am sorry to hear you are unwell. You are granted a 2-day extension for the final project. Please submit it by Wednesday at midnight. Get well soon!\n\nBest,\nCourse Support"
        }
      ]
    }
  };

  const [activeSimCat, setActiveSimCat] = useState('it');
  const [selectedSimEmailIdx, setSelectedSimEmailIdx] = useState(0);

  // Auto-reset email selection when changing categories
  useEffect(() => {
    setSelectedSimEmailIdx(0);
  }, [activeSimCat]);

  // Navigate through simulator categories via arrows
  const handlePrevCategory = () => {
    const keys = Object.keys(simulatorCategories);
    const currIdx = keys.indexOf(activeSimCat);
    const prevIdx = (currIdx - 1 + keys.length) % keys.length;
    setActiveSimCat(keys[prevIdx]);
  };

  const handleNextCategory = () => {
    const keys = Object.keys(simulatorCategories);
    const currIdx = keys.indexOf(activeSimCat);
    const nextIdx = (currIdx + 1) % keys.length;
    setActiveSimCat(keys[nextIdx]);
  };

  // Get current active simulator email data
  const currentSimEmailList = simulatorCategories[activeSimCat].emails;
  const activeSimEmail = currentSimEmailList[selectedSimEmailIdx] || currentSimEmailList[0];

  // ==========================================
  // MODULE 3: Accordions Features (Left-right Accordion Section)
  // ==========================================
  const accordionFeatures = [
    {
      id: 'sent_emails',
      label: "Trained on your sent emails",
      description: "MailJet automatically learns from your past email replies. Every draft mirrors your custom tone settings, follows your company guidelines, and speaks in your authentic brand voice. No guesswork, just results."
    },
    {
      id: 'smart_labels',
      label: "Smart labels for your inbox",
      description: "Automatically categorizes incoming emails by department, priority, or sentiment. Color-coded visual tags help you identify urgent customer escalations, sales leads, or routine queries in a single glance."
    },
    {
      id: 'automation',
      label: "Powerful tools for automation",
      description: "Trigger background actions whenever specific unread logs load. Sync actionable elements directly into your Figma workflows, Slack alerts, or calendar schedules without lifting a finger."
    },
    {
      id: 'view_drafts',
      label: "View all drafts",
      description: "Keep complete control over all AI drafts inside a sleek history dashboard. Review, refine with a high-fidelity inline text editor, customize sliders, and approve with a single click before shipping."
    }
  ];

  const [activeAccId, setActiveAccId] = useState('sent_emails');

  // ==========================================
  // MODULE 4: Collapsible FAQ Section
  // ==========================================
  const faqData = [
    {
      q: "What is MailJet's Gmail Agent?",
      a: "MailJet's Gmail Agent is a state-of-the-art AI-powered assistant that connects securely to your email account. It automatically generates context-aware, professional draft replies to incoming emails and organizes your inbox, saving you hours of manual typing while keeping you in complete control."
    },
    {
      q: "How does MailJet work?",
      a: "MailJet integrates seamlessly with your email providers. When a new email arrives, it reads the content, references your custom tone settings (Polite, Direct, Concise), and invokes advanced AI models to draft a perfect reply. The draft is immediately made available for your one-click review and copy."
    },
    {
      q: "Is my Gmail account secure when using MailJet's Gmail Agent?",
      a: "Yes, security is our top priority. MailJet utilizes industry-standard OAuth2 secure protocol to access your email account safely. Your data is encrypted and saved under secure profile logs in MongoDB, ensuring complete privacy compliance."
    }
  ];

  const [expandedFaqIdx, setExpandedFaqIdx] = useState(0);

  return (
    <div className="home-overhauled">
      {/* 1. Navbar */}
      <header className="navbar">
        <Link to="/" className="logo-link-brand" style={{ textDecoration: 'none' }}>
          <Logo size={28} showText={true} />
        </Link>
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#demo" className="nav-link">Live Demo</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle dark/light mode">
            {theme === 'dark' ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-premium-gradient">
              Dashboard ⚡
            </Link>
          ) : (
            <Link to="/login" className="btn btn-premium-gradient">
              Log In
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Header Block (Highly Interactive & Colorful Overhaul) */}
      <section className="hero-overhauled-section">
        <div className="hero-split-container">
          
          {/* Left Column: Typography and CTAs */}
          <div className="hero-left-col">
            <div className="hero-badge-interactive">⚡ MailJet Gmail Agent</div>
            <h1 className="hero-large-title">
              AI drafts for your <span className="highlight-text">Gmail</span>
            </h1>
            <p className="hero-soft-subtitle">
              Connect your AI Agent to your Gmail account and instantly get draft responses for every incoming customer email.
            </p>
            <div className="hero-ctas">
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-hero-cta btn-purple-brand">
                Connect Your Gmail — It's Free
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Live Animated Mockup */}
          <div className="hero-right-col">
            <div className="hero-interactive-stage">
              
              {/* Floating Gmail Logo Badge */}
              <div className={`hero-gmail-logo-badge ${heroStep >= 1 ? 'visible' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>

              {/* Card 1: Incoming Message (John) */}
              <div className={`hero-mock-incoming-card ${heroStep >= 0 ? 'visible' : ''}`}>
                <div className="mock-card-header">
                  <div className="mock-card-header-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <strong>Gmail</strong>
                  </div>
                  <span className="mock-card-header-time">Inbox ×</span>
                </div>
                <div className="mock-card-body">
                  <div className="mock-meta-row">
                    <div className="mock-user-avatar">J</div>
                    <div className="mock-meta-info">
                      <span className="mock-subject">Working hours?</span>
                      <span className="mock-sender">From: john@darcy.com</span>
                    </div>
                  </div>
                  <p className="mock-text-content">
                    Hi there, <br/>
                    I'm John. I'd love to visit your store on Sunday. Just wanted to check if you'll be open that day.
                  </p>
                </div>
              </div>

              {/* Card 2: AI Draft Reply Message */}
              <div className={`hero-mock-reply-card ${heroStep >= 2 ? 'visible' : ''}`}>
                <div className="mock-card-header reply">
                  <div className="mock-card-header-left">
                    <Logo size={14} />
                    <strong>Reply to: john@darcy.com</strong>
                  </div>
                  <span className="ai-badge-coral inline">AI Draft</span>
                </div>
                <div className="mock-card-body reply">
                  <div className="mock-text-content reply">
                    {heroStep === 2 && heroTypedText === '' ? (
                      <div className="typing-loader-sandbox">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      heroTypedText.split('\n').map((para, idx) => (
                        <p key={idx} style={{ margin: para.trim() === '' ? '0.4rem 0' : '0.1rem 0' }}>
                          {para}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow and Hand-drawn Style Note */}
              <div className={`hero-handwritten-note-box ${heroStep >= 3 ? 'visible' : ''}`}>
                <div className="handwritten-arrow">⤷</div>
                <span className="handwritten-text">Draft ready to send!</span>
              </div>

              {/* Smiling Customer Support Agent */}
              <div className="hero-agent-visual-overlay">
                <img 
                  src="/frontend/src/assets/hero_draft_visual.png" 
                  alt="Agent holding a laptop" 
                  className="hero-agent-image"
                  onError={(e) => {
                    // Fail-safe if image has loading issue, show beautiful CSS visual
                    e.target.style.display = 'none';
                  }}
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Try Gmail Agent Section (Interactive Textbox Banner - M1) */}
      <section id="demo" className="try-agent-section">
        <div className="try-agent-container">
          <h2 className="try-title-glow">Try Gmail Agent</h2>
          <p className="try-subtitle-text">
            See your Gmail Agent in action — Simply select a category, paste an email, and watch how your agent generates a smart, personalized reply.
          </p>

          <div className="try-sandbox-card">
            {/* Input display */}
            <div className="try-sandbox-header">
              <span className="try-dot red"></span>
              <span className="try-dot yellow"></span>
              <span className="try-dot green"></span>
              <span className="try-sandbox-title">Incoming Email Preview</span>
            </div>
            <div className="try-sandbox-body">
              <textarea
                className="try-textarea-input"
                value={tryInputText}
                readOnly={true}
                placeholder="Select a category pill below to load an example unread email..."
                disabled={isTryLoading}
                style={{ cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
              
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--accent)', 
                background: 'rgba(99, 102, 241, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: '1px solid rgba(99, 102, 241, 0.15)', 
                marginBottom: '0.5rem', 
                fontWeight: 600,
                textAlign: 'left'
              }}>
                💡 Note: This sandbox uses fixed email templates. Register or Log in to compose drafts for your own custom emails!
              </div>
              
              <div className="try-sandbox-actions">
                <button
                  onClick={handleGenerateTryDraft}
                  className="btn btn-generate-sandbox"
                  disabled={isTryLoading || !tryInputText.trim()}
                >
                  {isTryLoading ? (
                    <>
                      <span className="sandbox-spinner"></span>
                      Generating Draft...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                      </svg>
                      Generate Draft Reply
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Output Preview (revealed dynamically) */}
            {tryOutputText && (
              <div className="try-output-container">
                <div className="try-output-header">
                  <Logo size={14} />
                  <span>MailJet Smart Draft Reply</span>
                </div>
                <div className="try-output-content">
                  {tryOutputText}
                </div>
              </div>
            )}
          </div>

          {/* Interactive pills below card */}
          <div className="try-category-pills">
            <button
              onClick={() => handleTryTabClick('product_order')}
              className={`try-pill ${activeTryTab === 'product_order' ? 'active' : ''}`}
            >
              💬 Product Order
            </button>
            <button
              onClick={() => handleTryTabClick('helpdesk')}
              className={`try-pill ${activeTryTab === 'helpdesk' ? 'active' : ''}`}
            >
              ⭐ Helpdesk
            </button>
            <button
              onClick={() => handleTryTabClick('it_service')}
              className={`try-pill ${activeTryTab === 'it_service' ? 'active' : ''}`}
            >
              💼 IT Service
            </button>
            <button
              onClick={() => handleTryTabClick('appointment')}
              className={`try-pill ${activeTryTab === 'appointment' ? 'active' : ''}`}
            >
              🕒 Appointment
            </button>
          </div>
        </div>
      </section>

      {/* 4. How Gmail Agent works (M2) */}
      <section className="how-it-works-section">
        <h2 className="how-it-works-title">How <span className="highlight-text">Gmail Agent</span> works</h2>
        
        <div className="how-grid-container">
          {/* Step 1 */}
          <div className="how-step-card">
            <div className="how-step-visual">
              <div className="integration-bubble">
                <div className="integration-brand">
                  <Logo size={20} />
                  <span>MailJet</span>
                </div>
                <span className="plus-sign">+</span>
                <div className="gmail-bubble">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Gmail</span>
                </div>
              </div>
              <button className="btn btn-mock-auth">Authenticate</button>
            </div>
            <div className="how-step-info">
              <span className="how-step-number">1</span>
              <h3>Authenticate your account</h3>
              <p>Connect your Gmail account securely to activate your MailJet smart workspace.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="how-step-card">
            <div className="how-step-visual">
              <div className="learning-mock-box">
                <div className="learning-mock-header">
                  <div className="avatar-small">👩🏽‍💼</div>
                  <div className="learning-meta">
                    <span className="learning-title">Learning your tone...</span>
                    <div className="mock-progress-bar"><div className="mock-progress-fill" style={{ width: '70%' }}></div></div>
                  </div>
                </div>
                <ul className="learning-checklist">
                  <li className="checked">✓ Reviewing your emails</li>
                  <li className="checked">✓ Categorizing your emails</li>
                  <li className="loading">⏳ Learning writing style</li>
                </ul>
              </div>
            </div>
            <div className="how-step-info">
              <span className="how-step-number">2</span>
              <h3>Wait for auto-learning</h3>
              <p>Your agent reviews your sent emails to understand your personal tone and writing styles.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="how-step-card">
            <div className="how-step-visual">
              <div className="gmail-mockup-card">
                <div className="gmail-mock-header">
                  <span className="gmail-logo-icon">M</span>
                  <span className="gmail-label">Draft email ready!</span>
                </div>
                <div className="gmail-mock-body">
                  <p className="gmail-to">To: daisy@darcy.com</p>
                  <p className="gmail-subject">Subject: Project Update <span className="ai-badge-coral">AI Draft</span></p>
                  <div className="gmail-lines"></div>
                  <div className="gmail-lines short"></div>
                </div>
              </div>
            </div>
            <div className="how-step-info">
              <span className="how-step-number">3</span>
              <h3>Review drafts</h3>
              <p>When new emails arrive, your agent automatically drafts replies, ready for your final approval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. See MailJet Gmail Agent in Action (Horizontal Switcher & Sidebar - M3) */}
      <section className="dark-action-section">
        <h2 className="dark-action-title">
          See <span className="highlight-text">MailJet</span> in action
        </h2>

        {/* Categories Horizontal Switcher */}
        <div className="dark-category-tabs">
          <button
            onClick={() => setActiveSimCat('it')}
            className={`dark-tab ${activeSimCat === 'it' ? 'active' : ''}`}
          >
            IT customer service
          </button>
          <button
            onClick={() => setActiveSimCat('healthcare')}
            className={`dark-tab ${activeSimCat === 'healthcare' ? 'active' : ''}`}
          >
            Healthcare service
          </button>
          <button
            onClick={() => setActiveSimCat('products')}
            className={`dark-tab ${activeSimCat === 'products' ? 'active' : ''}`}
          >
            Products order
          </button>
          <button
            onClick={() => setActiveSimCat('course')}
            className={`dark-tab ${activeSimCat === 'course' ? 'active' : ''}`}
          >
            Course helpdesk
          </button>
        </div>

        {/* Main interactive split console */}
        <div className="dark-console-container">
          
          {/* Left Arrow */}
          <button onClick={handlePrevCategory} className="arrow-nav-btn prev" aria-label="Previous Category">
            ←
          </button>

          <div className="dark-console-card">
            {/* Left Console Content Info */}
            <div className="console-left-info">
              <h3 className="console-title">{simulatorCategories[activeSimCat].title}</h3>
              <p className="console-desc">{simulatorCategories[activeSimCat].desc}</p>
              
              <Link to="/register" className="btn btn-console-cta">
                Create a Gmail Agent ➔
              </Link>

              <div className="console-selectors-list">
                <span className="selector-label">View example emails</span>
                {currentSimEmailList.map((email, idx) => (
                  <button
                    key={email.key}
                    onClick={() => setSelectedSimEmailIdx(idx)}
                    className={`console-selector-item ${selectedSimEmailIdx === idx ? 'active' : ''}`}
                  >
                    {email.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Console Thread mockup */}
            <div className="console-right-mockup">
              <div className="thread-window">
                <div className="thread-header">
                  <span className="thread-title">{activeSimEmail.label}</span>
                  <span className="thread-badge">Inbox</span>
                </div>
                
                <div className="thread-body">
                  {/* Incoming email message block */}
                  <div className="msg-block incoming">
                    <div className="msg-avatar-circle">JW</div>
                    <div className="msg-bubble-content">
                      <div className="msg-meta">
                        <strong>Sender</strong> &lt;user@company.com&gt;
                      </div>
                      <p className="msg-body-text">{activeSimEmail.incoming}</p>
                    </div>
                  </div>

                  {/* Outgoing AI Draft message block */}
                  <div className="msg-block outgoing">
                    <div className="msg-avatar-circle ai">
                      <Logo size={12} />
                    </div>
                    <div className="msg-bubble-content">
                      <div className="msg-meta">
                        <strong>MailJet Draft</strong> <span className="ai-badge-coral inline">Draft</span>
                      </div>
                      <p className="msg-body-text reply">{activeSimEmail.reply}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Arrow */}
          <button onClick={handleNextCategory} className="arrow-nav-btn next" aria-label="Next Category">
            ➔
          </button>
        </div>
      </section>

      {/* 6. Speed up replies without sacrificing quality (Accordion & Learning visual - M4) */}
      <section id="features" className="features-accordion-section">
        <h2 className="accordion-section-title">Speed up replies without sacrificing quality</h2>

        <div className="accordion-grid-wrapper">
          {/* Left: Accordion controls */}
          <div className="accordion-controls-panel">
            {accordionFeatures.map((feat) => {
              const isActive = activeAccId === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => setActiveAccId(feat.id)}
                  className={`feature-accordion-item ${isActive ? 'active' : ''}`}
                >
                  <div className="accordion-item-header">
                    <h3>{feat.label}</h3>
                    <span className="accordion-icon">{isActive ? '↓' : '➔'}</span>
                  </div>
                  {isActive && (
                    <div className="accordion-item-body">
                      <p>{feat.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Graphic learning block mockup */}
          <div className="accordion-graphics-panel">
            <div className="learning-status-showcase">
              <div className="showcase-header">
                <div className="status-avatar-circle">👩🏿‍💻</div>
                <div className="status-meta">
                  <span className="status-title">Learning status</span>
                  <div className="status-indicator-bar"><div className="status-indicator-fill"></div></div>
                </div>
              </div>
              <div className="showcase-checklist">
                <div className="checklist-row completed">
                  <span className="icon">✓</span>
                  <span>Reviewing emails</span>
                </div>
                <div className="checklist-row completed">
                  <span className="icon">✓</span>
                  <span>Categorizing emails</span>
                </div>
                <div className="checklist-row completed">
                  <span className="icon">✓</span>
                  <span>Analyzing writing style</span>
                </div>
              </div>
              <div className="added-knowledge-badge">
                <span className="knowledge-icon">✔</span>
                <div className="knowledge-meta">
                  <strong>Added Knowledge</strong>
                  <p>Learning completed successfully</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Move faster, stay consistent (Featured split grid) */}
      <section className="featured-banner-section">
        <div className="featured-grid-container">
          {/* Left Side: Mockup Image overlay */}
          <div className="featured-visual-left">
            <div className="featured-image-wrapper">
              <img 
                src="/frontend/src/assets/mailjet_logo_full.png" 
                alt="Product visual" 
                className="featured-bg-photo" 
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide if file missing
                }}
              />
              {/* Inbox Mockup Overlay */}
              <div className="inbox-mockup-overlay">
                <div className="inbox-header">
                  <span className="inbox-dot"></span>
                  <span className="inbox-dot"></span>
                  <span>Gmail Inbox</span>
                </div>
                <div className="inbox-rows">
                  <div className="inbox-row">
                    <span>✓ Dr. Darcy Checkup</span>
                    <span className="ai-badge-coral">Draft</span>
                  </div>
                  <div className="inbox-row">
                    <span>✓ Server Maintenance</span>
                    <span className="ai-badge-coral">Draft</span>
                  </div>
                  <div className="inbox-row">
                    <span>✓ Refund Query #882</span>
                    <span className="ai-badge-coral">Draft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Text & CTA */}
          <div className="featured-info-right">
            <span className="featured-small-tag">Move faster, stay consistent</span>
            <h2 className="featured-heading">From hours to seconds, speed up your replies</h2>
            <p className="featured-desc">
              Save time, stay consistent, and deliver outstanding communication experiences while keeping full manual control over everything that gets sent.
            </p>
            <Link to="/register" className="btn btn-featured-cta">
              Connect Your Gmail — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section (Real results from real people) */}
      <section id="testimonials" className="testimonials-section">
        <h2 className="testimonials-title">Real results from real people</h2>
        
        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <span className="quote-mark">“</span>
            <p className="testimonial-quote">
              My motivation to use the Gmail Agent? Getting my life back. Seriously. I get a hundred emails a day. The Gmail Agent is a huge time-saver that allows me to be more responsive. It's a very practical tool that every small business owner I know would need. This is next-level.
            </p>
            <div className="testimonial-author">
              <strong>Elana Etten</strong>
              <span>AI-Automation Consultant</span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <span className="quote-mark">“</span>
            <p className="testimonial-quote">
              The MailJet Gmail Agent is much better than other AI email tools. Its key advantage is that it's automatic — it writes a draft reply for every email without being prompted. It basically answers the questions for me. All I have to do is review the email and hit send.
            </p>
            <div className="testimonial-author">
              <strong>Jotform User</strong>
              <span>Customer Support Lead</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA Navy Banner (AI Powered Drafts for Every Email) */}
      <section className="banner-navy-cta">
        <div className="banner-icon-box">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <h2 className="banner-title">AI Powered Drafts for Every Email</h2>
        <p className="banner-subtitle">Deliver better support while keeping full control over what gets sent.</p>
        <Link to="/register" className="btn btn-banner-cta">
          Connect Your Gmail — It's Free
        </Link>
      </section>

      {/* 10. FAQ Block */}
      <section id="faq" className="faq-section">
        <h2 className="faq-title">FAQ</h2>

        <div className="faq-container">
          {faqData.map((item, idx) => {
            const isExpanded = expandedFaqIdx === idx;
            return (
              <div 
                key={idx}
                className={`faq-item ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedFaqIdx(isExpanded ? -1 : idx)}
              >
                <div className="faq-item-header">
                  <h3>{item.q}</h3>
                  <span className="faq-toggle-icon">{isExpanded ? '—' : '+'}</span>
                </div>
                {isExpanded && (
                  <div className="faq-item-body">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn-secondary btn-faq-more">View More</button>
      </section>

      {/* 11. Multi-column Premium Footer */}
      <footer className="footer-overhauled">
        <div className="footer-columns">
          {/* Column 1: Brand */}
          <div className="footer-column brand">
            <Logo size={24} showText={true} />
            <p className="footer-brand-desc">
              MailJet is the easiest online email assistant with powerful automation rules that get it done. Trusted by professionals worldwide to streamline communication.
            </p>
          </div>

          {/* Column 2: MailJet */}
          <div className="footer-column">
            <h4>MailJet</h4>
            <ul>
              <li><Link to="/register">Signup</Link></li>
              <li><Link to="/dashboard">My Workspace</Link></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Marketplace */}
          <div className="footer-column">
            <h4>Marketplace</h4>
            <ul>
              <li><a href="#">Templates</a></li>
              <li><a href="#">Themes</a></li>
              <li><a href="#">Widgets</a></li>
              <li><a href="#">Integrations</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">User Guide</a></li>
              <li><a href="#">Webinars</a></li>
              <li><a href="#">Podcasts</a></li>
            </ul>
          </div>

          {/* Column 5: Apps */}
          <div className="footer-column apps">
            <h4>Apps</h4>
            <div className="app-badge-mock">Google Play</div>
            <div className="app-badge-mock">App Store</div>
            <div className="app-badge-mock salesforce">Salesforce AppExchange</div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="bottom-left">
            <span className="office-addr">4 Embarcadero Center, Suite 780, San Francisco CA 94111</span>
            <p className="copy-text">© 2026 MailJet Inc. The name "MailJet" and the logo are registered trademarks.</p>
          </div>
          
          <div className="bottom-right">
            <select className="lang-selector" defaultValue="en">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Español</option>
            </select>
            <div className="social-row">
              <span className="social-icon">f</span>
              <span className="social-icon">𝕏</span>
              <span className="social-icon">in</span>
              <span className="social-icon">o</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
