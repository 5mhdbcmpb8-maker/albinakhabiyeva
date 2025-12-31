import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Instagram, MapPin, X, ArrowRight, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

// --- CONFIGURATION ---
// Ana arka plan resmi (hero.jpg demiştin)
const MAIN_IMAGE_URL = "/hero.jpg"; 

const PORTFOLIO_IMAGES = [
  "/DSC00042_newer_1.jpg",
  "/IMG_7542.jpg",
  "/IMG_7543.jpg",
  "/IMG_7544.jpg",
  "/IMG_7545.jpg",
  "/IMG_7546.jpg",
  "/IMG_7547.jpg",
  "/IMG_7548.jpg",
  "/IMG_7549.jpg",
  "/iScreen Shot 2025-12-31 at 00.40.29.jpg", // Dosya ismindeki boşluklara ve karakterlere dikkat!
  "/iScreen Shot 2025-12-31 at 00.39.50.jpg",
  "/iScreen Shot 2025-12-31 at 00.42.12.jpg",
  "/iScreen Shot 2025-12-31 at 00.42.30.jpg",
  "/iScreen Shot 2025-12-31 at 00.43.01.jpg"
];

// --- Components ---

const SocialIcon = ({ Icon, href, label }: { Icon: any, href: string, label?: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    style={{ 
      color: 'inherit', 
      textDecoration: 'none', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
      padding: '10px', 
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' // Strong dark shadow for visibility against any bg
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.2)';
      e.currentTarget.style.opacity = '1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.opacity = '1';
    }}
  >
    <Icon size={28} strokeWidth={2} /> {/* Slightly larger and thicker */}
  </a>
);

// --- Views ---

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{ 
      position: 'fixed', 
      top: '30px', 
      right: '30px', 
      background: 'rgba(255,255,255,0.1)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff', 
      cursor: 'pointer',
      zIndex: 300, // Very high z-index to ensure clickability
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
      e.currentTarget.style.transform = 'scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    <X size={24} strokeWidth={1.5} />
  </button>
);

const PortfolioView = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }} // Faster transition
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 200, 
        backgroundColor: '#050505', 
        overflowY: 'auto',
        color: '#fff',
      }}
    >
      <CloseButton onClick={onClose} />

      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '120px 20px 40px 20px'
      }}>
        <h2 style={{ 
            fontFamily: 'Helvetica, Arial, sans-serif', 
            fontWeight: 300, 
            fontSize: '16px', 
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '60px',
            opacity: 0.6
          }}>
            Selected Works
        </h2>

        {/* Masonry Layout using CSS Columns */}
        <div style={{ 
          columnCount: 3, 
          columnGap: '20px',
        }} className="masonry-grid">
          <style>{`
            @media (max-width: 1000px) { .masonry-grid { column-count: 2 !important; } }
            @media (max-width: 600px) { .masonry-grid { column-count: 1 !important; } }
          `}</style>
          
          {PORTFOLIO_IMAGES.map((src, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }} // Better lazy loading feel
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
              style={{ 
                breakInside: 'avoid', 
                marginBottom: '20px', 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '4px'
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={src} 
                  alt={`Tattoo work ${i + 1}`} 
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    filter: 'grayscale(100%) brightness(0.9)',
                    transition: 'filter 0.4s ease, transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'grayscale(100%) brightness(0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#888' }}>Reference Images</span>
      
      <div 
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{ 
          border: `1px dashed ${dragActive ? '#fff' : '#444'}`,
          backgroundColor: dragActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderRadius: '2px'
        }}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept="image/png, image/jpeg, image/jpg, application/pdf"
          onChange={handleChange}
          style={{ display: 'none' }} 
        />
        <Upload size={20} color={dragActive ? '#fff' : '#666'} />
        <span style={{ fontSize: '12px', color: '#888' }}>
          Drop files or click to upload
        </span>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((file, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '12px',
              color: '#ccc',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {file.type.includes('pdf') ? <FileText size={14} /> : <ImageIcon size={14} />}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                  {file.name}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', padding: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingInput = ({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#888' }}>{label}</span>
    <input 
      type={type} 
      placeholder={placeholder} 
      style={{ 
        background: 'transparent',
        border: 'none', 
        borderBottom: '1px solid #333', 
        padding: '12px 0', 
        outline: 'none', 
        fontSize: '16px', 
        color: '#fff',
        borderRadius: 0,
        transition: 'border-color 0.3s'
      }} 
      onFocus={(e) => e.target.style.borderBottomColor = '#fff'}
      onBlur={(e) => e.target.style.borderBottomColor = '#333'}
    />
  </label>
);

const BookingView = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 200, 
        backgroundColor: 'rgba(5, 5, 5, 0.95)', // Dark transparent background
        backdropFilter: 'blur(20px)',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto',
      }}
    >
      <CloseButton onClick={onClose} />
      
      <div style={{ 
        width: '100%', 
        maxWidth: '550px', 
        padding: '100px 20px 40px', 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Helvetica, Arial, sans-serif', 
            fontWeight: 300, 
            fontSize: '32px', 
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#fff'
          }}>
            Booking Request
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Tell me about your idea. I'll get back to you shortly.
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} onSubmit={(e) => e.preventDefault()}>
          <BookingInput label="Full Name" placeholder="Jane Doe" />
          <BookingInput label="Email Address" placeholder="jane@example.com" type="email" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <BookingInput label="Placement" placeholder="e.g. Forearm" />
            <BookingInput label="Size (cm)" placeholder="e.g. 15x8" />
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#888' }}>Description</span>
            <textarea 
              placeholder="Describe your concept, style preferences, and any specific details..." 
              rows={4} 
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #333', 
                padding: '15px', 
                outline: 'none', 
                fontSize: '15px', 
                color: '#fff',
                resize: 'none',
                borderRadius: '4px',
                lineHeight: 1.5,
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#666'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </label>

          <FileUpload />

          <button 
            style={{ 
              marginTop: '30px', 
              backgroundColor: '#fff', 
              color: '#000', 
              border: 'none', 
              padding: '18px', 
              fontSize: '13px', 
              fontWeight: 600,
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              borderRadius: '2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ddd';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Submit Request <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// --- App ---

const App = () => {
  const [view, setView] = useState<'home' | 'portfolio' | 'booking'>('home');

  // Mouse position state
  const mouseX = useMotionValue(-1000); 
  const mouseY = useMotionValue(-1000);

  // --- Physics for the Blob Trail ---
  // Improved config for responsive feel
  const mainX = useSpring(mouseX, { damping: 40, stiffness: 600, mass: 0.1 });
  const mainY = useSpring(mouseY, { damping: 40, stiffness: 600, mass: 0.1 });

  // Simplified trails for performance
  const tail1X = useSpring(mouseX, { damping: 30, stiffness: 300, mass: 0.2 });
  const tail1Y = useSpring(mouseY, { damping: 30, stiffness: 300, mass: 0.2 });

  const tail2X = useSpring(mouseX, { damping: 35, stiffness: 200, mass: 0.4 });
  const tail2Y = useSpring(mouseY, { damping: 35, stiffness: 200, mass: 0.4 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const maskImage = useMotionTemplate`radial-gradient(circle 250px at ${mainX}px ${mainY}px, black, transparent),
    radial-gradient(circle 120px at ${tail1X}px ${tail1Y}px, black, transparent),
    radial-gradient(circle 80px at ${tail2X}px ${tail2Y}px, black, transparent)`;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#050505' }}>
      
      {/* BACKGROUND LAYERS */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 10
        }}
      >
        <div 
          style={{ 
            width: '100%', height: '100%',
            backgroundImage: `url(${MAIN_IMAGE_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 45%',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%) brightness(0.6) contrast(1.1)',
          }}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 20,
          maskImage: maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
         <div 
          style={{ 
            width: '100%', height: '100%',
            backgroundImage: `url(${MAIN_IMAGE_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 45%',
            backgroundRepeat: 'no-repeat',
            filter: 'saturate(1.2) brightness(1.1)',
          }}
        />
      </motion.div>

      {/* GRADIENT OVERLAYS FOR VISIBILITY */}
      {/* Top Left Gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '400px', background: 'radial-gradient(circle at top left, rgba(0,0,0,0.8), transparent 70%)', zIndex: 90, pointerEvents: 'none' }} />
      {/* Top Right Gradient */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '200px', background: 'radial-gradient(circle at top right, rgba(0,0,0,0.8), transparent 70%)', zIndex: 90, pointerEvents: 'none' }} />

      {/* UI LAYER */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 100,
        mixBlendMode: 'difference', 
        color: '#fff',
        pointerEvents: 'none' 
      }}>
        
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          
          {/* Top Left: Name */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', flexDirection: 'column', pointerEvents: 'auto' }}>
            <span style={{ 
              fontSize: 'clamp(40px, 6vw, 80px)', 
              fontWeight: 300, 
              lineHeight: 0.9, 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Albina
            </span>
            <span style={{ 
              fontSize: 'clamp(40px, 6vw, 80px)', 
              fontWeight: 600, 
              lineHeight: 0.9, 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              Khabiyeva
            </span>
            {/* Removed Berlin/Location */}
          </div>

          {/* Top Right: Navigation */}
          <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', gap: '40px', pointerEvents: 'auto' }}>
            <button 
              onClick={() => setView('portfolio')}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px', 
                fontWeight: 600, 
                color: 'currentColor', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.2em',
                cursor: 'pointer',
                borderBottom: '2px solid transparent',
                transition: 'border-color 0.2s',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)' // Added shadow for extra visibility
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottom = '2px solid currentColor'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottom = '2px solid transparent'}
            >
              PORTFOLIO
            </button>
            <button 
              onClick={() => setView('booking')}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px', 
                fontWeight: 600, 
                color: 'currentColor', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.2em',
                cursor: 'pointer',
                borderBottom: '2px solid transparent',
                transition: 'border-color 0.2s',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)' // Added shadow for extra visibility
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottom = '2px solid currentColor'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottom = '2px solid transparent'}
            >
              BOOKING
            </button>
          </div>
        </div>
      </div>

      {/* FIXED UI LAYER - No Blend Mode - For Social Icons */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 101, // Higher Z-index
        color: '#fff', // Always white
        pointerEvents: 'none' 
      }}>
         <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Bottom Right: Social Icons - pointerEvents: 'auto' needed here */}
            <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
              <SocialIcon Icon={Instagram} href="https://www.instagram.com/tattoo.alb/" label="Instagram" />
            </div>
         </div>
      </div>

      {/* OVERLAY VIEWS (Z > 100) */}
      <AnimatePresence>
        {view === 'portfolio' && (
          <PortfolioView onClose={() => setView('home')} />
        )}
        {view === 'booking' && (
          <BookingView onClose={() => setView('home')} />
        )}
      </AnimatePresence>

    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
