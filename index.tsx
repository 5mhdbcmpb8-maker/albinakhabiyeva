import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X, ArrowRight, Upload, FileText, Image as ImageIcon, Trash2, Lock, Plus, Settings, Image as ImgIcon, MessageSquare, CheckCircle, ChevronDown, Edit2, GripVertical, Home, Move, Maximize2 } from 'lucide-react';

// --- CONFIGURATION ---
const DEFAULT_MAIN_IMAGE_URL = "https://i.ibb.co/PZMPwgnC/DSC08612-new-ps-2.jpg"; 

// NOTIFICATION CONFIGURATION (ntfy.sh)
const NTFY_TOPIC = "tattoo_alb_requests_v1";

// Theme Colors - Silver/Elite
const THEME = {
  primary: '#e0e0e0', // Silver
  secondary: '#a0a0a0', // Darker Silver
  accent: '#ffffff', // White
  bg: '#050505',
  border: 'rgba(255, 255, 255, 0.2)',
  borderHover: '#ffffff',
  gradient: `radial-gradient(circle 100px at var(--mouse-x) var(--mouse-y), #ffffff 0%, #e0e0e0 40%, rgba(255,255,255,0.1) 100%)`
};

const DEFAULT_PORTFOLIO = [
  "https://i.ibb.co/CxzGX9L/i-Screen-Shoter-Safari-251231004301.jpg",
  "https://i.ibb.co/rRbrV2sV/i-Screen-Shoter-Safari-251231004230.jpg",
  "https://i.ibb.co/WvpMgcfp/i-Screen-Shoter-Safari-251231004212.jpg",
  "https://i.ibb.co/wh7GxJXg/i-Screen-Shoter-20251231004029161.jpg",
  "https://i.ibb.co/cSMvhVyY/i-Screen-Shoter-Safari-251231003950.jpg",
  "https://i.ibb.co/YFXhHjRg/DSC00042-newer-1.jpg",
  "https://i.ibb.co/KjSvVqhb/IMG-7542.jpg",
  "https://i.ibb.co/8n5LxKV5/IMG-7543.jpg",
  "https://i.ibb.co/3YPpgpKp/IMG-7544.jpg",
  "https://i.ibb.co/dsJ80mNw/DSC08582-new-ps.jpg",
  "https://i.ibb.co/XrvhhKCq/IMG-7547.jpg",
  "https://i.ibb.co/spbBbBKr/IMG-7546.jpg",
  "https://i.ibb.co/zTvxDwtz/IMG-7545.jpg",
  "https://i.ibb.co/DHt9yhP0/IMG-7548.jpg",
  "https://i.ibb.co/Z1FjY7qx/IMG-7549.jpg"
];

// UPDATED: Removed Color Preference, Added Description at the end
const DEFAULT_FORM_FIELDS = [
  { id: 'placement', label: 'Placement', type: 'text', placeholder: 'e.g. Forearm' },
  { id: 'size', label: 'Size (cm)', type: 'text', placeholder: 'e.g. 15x8' },
  { id: 'description', label: 'Concept Description', type: 'textarea', placeholder: 'Describe your idea, placement, and any specific elements you want included.' }
];

// --- Helper Functions ---

// Updated Compression for Booking Images to fix LocalStorage Quota
// Reduced max width and quality slightly to ensure more bookings fit in LocalStorage
const compressAndConvertToBase64 = (file: File): Promise<{name: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max width 600px is enough for reference thumbnails
        const MAX_WIDTH = 600; 
        const scaleSize = MAX_WIDTH / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // 0.5 quality to save space
            resolve({
                name: file.name,
                data: canvas.toDataURL('image/jpeg', 0.5)
            });
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const processFiles = (files: File[]): Promise<{name: string, data: string}[]> => {
  return Promise.all(files.map(f => compressAndConvertToBase64(f)));
};

// --- Components ---

const FlashlightText = ({ children, className, style, onClick, active }: any) => (
  <div 
    className={className}
    onClick={onClick}
    style={{
      ...style,
      position: 'relative',
      color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255, 255, 255, 0.4)', 
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      display: 'inline-block',
      userSelect: 'none',
      zIndex: 200,
    }}
  >
    <span 
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundImage: `radial-gradient(
          circle 120px at var(--mouse-x) var(--mouse-y), 
          #FFFFF0 0%,      /* Cream/Ivory */
          #40E0D0 50%,     /* Turquoise */
          transparent 100%
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        opacity: 1,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 5px #40E0D0) drop-shadow(0 0 12px #FFFFF0)',
        mixBlendMode: 'screen',
        willChange: 'filter',
        transform: 'translateZ(0)' 
      }}
    >
      {children}
    </span>
    {children}
  </div>
);

const SocialIcon = ({ Icon, href, label }: { Icon: any, href: string, label?: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    style={{ cursor: 'pointer', zIndex: 200 }}
  >
    <FlashlightText>
       <Icon size={28} strokeWidth={1.5} />
    </FlashlightText>
  </a>
);

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      background: 'rgba(255,255,255,0.05)', 
      backdropFilter: 'blur(10px)',
      border: `1px solid ${THEME.border}`,
      borderRadius: '50%',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff', 
      cursor: 'pointer',
      zIndex: 300,
      transition: 'all 0.2s ease',
    }}
  >
    <X size={24} strokeWidth={1.5} />
  </button>
);

// --- Admin Sub-Components ---

const AdminTabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '15px 10px', background: active ? '#fff' : 'rgba(255,255,255,0.05)',
      color: active ? '#000' : '#888', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
      transition: 'all 0.2s',
      minWidth: '70px'
    }}
  >
    <Icon size={18} /> <span>{label}</span>
  </button>
);

// High quality compression for Portfolio images (larger than reference images)
const compressPortfolioImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; 
        const scaleSize = MAX_WIDTH / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); 
      };
    };
  });
};

const AdminView = ({ onClose, bookings, setBookings, portfolioImages, setPortfolioImages, formFields, setFormFields, homeImage, setHomeImage }: any) => {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'portfolio' | 'form'>('bookings');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  
  // Form Builder State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState(''); 
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Portfolio State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const homeImageInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9702') { 
      setAuthorized(true);
    } else {
      alert('Wrong password');
    }
  };

  // Improved Delete Logic: 2-step confirmation on button
  const handleDeleteClick = (index: number) => {
    if (deleteConfirmIndex === index) {
        // Already confirmed, proceed to delete
        const updated = [...bookings];
        updated.splice(index, 1);
        setBookings(updated);
        try {
            localStorage.setItem('tattoo_bookings', JSON.stringify(updated));
        } catch(e) { console.error("LS Error", e); }
        setDeleteConfirmIndex(null);
    } else {
        // First click, show confirm
        setDeleteConfirmIndex(index);
    }
  };

  // --- Image Upload Handlers ---

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const selectedFiles = Array.from(e.target.files).slice(0, 20) as File[]; // Max 20 batch upload
        const processedImages = await Promise.all(selectedFiles.map(file => compressPortfolioImage(file)));
        const updated = [...processedImages, ...portfolioImages];
        setPortfolioImages(updated);
        localStorage.setItem('tattoo_portfolio', JSON.stringify(updated));
      } catch (err) {
        alert("Storage limit reached or upload error. Try deleting old images.");
      }
    }
  };

  const handleHomeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const compressedBase64 = await compressPortfolioImage(file);
        setHomeImage(compressedBase64);
        localStorage.setItem('tattoo_home_image', compressedBase64);
      } catch (err) {
        alert("Error uploading home image.");
      }
    }
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleFormDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
        const copyListItems = [...formFields];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setFormFields(copyListItems);
        localStorage.setItem('tattoo_form_fields', JSON.stringify(copyListItems));
    }
  };

  const handlePortfolioDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
        const copyListItems = [...portfolioImages];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setPortfolioImages(copyListItems);
        localStorage.setItem('tattoo_portfolio', JSON.stringify(copyListItems));
    }
  };

  // --- Delete Handlers ---

  const removePortfolioImage = (index: number) => {
    if(!window.confirm("Remove this image from portfolio?")) return;
    const updated = [...portfolioImages];
    updated.splice(index, 1);
    setPortfolioImages(updated);
    localStorage.setItem('tattoo_portfolio', JSON.stringify(updated));
  };

  const removeField = (index: number) => {
    if(!window.confirm("Remove this question from the form?")) return;
    const updated = [...formFields];
    updated.splice(index, 1);
    setFormFields(updated);
    localStorage.setItem('tattoo_form_fields', JSON.stringify(updated));
    if (editingIndex === index) {
        setEditingIndex(null);
        setNewFieldLabel('');
    }
  };

  const saveField = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newFieldLabel) return;
    
    const id = newFieldLabel.toLowerCase().replace(/\s+/g, '_');
    const newField: any = { 
        id, 
        label: newFieldLabel, 
        type: newFieldType,
        placeholder: '...'
    };

    if (newFieldType === 'radio' || newFieldType === 'select') {
        newField.options = newFieldOptions.split(',').map(s => s.trim()).filter(s => s !== '');
    }

    let updated;
    if (editingIndex !== null) {
        updated = [...formFields];
        updated[editingIndex] = newField;
        setEditingIndex(null);
    } else {
        updated = [...formFields, newField];
    }

    setFormFields(updated);
    localStorage.setItem('tattoo_form_fields', JSON.stringify(updated));
    
    setNewFieldLabel('');
    setNewFieldOptions('');
    setNewFieldType('text');
  };

  const editField = (index: number) => {
    const field = formFields[index];
    setNewFieldLabel(field.label);
    setNewFieldType(field.type);
    if (field.options) {
        setNewFieldOptions(field.options.join(', '));
    } else {
        setNewFieldOptions('');
    }
    setEditingIndex(index);
    const formEl = document.getElementById('form-builder-input');
    formEl?.scrollIntoView({ behavior: 'smooth' });
  };


  if (!authorized) {
    return (
       <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 500, background: '#050505', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white'
        }}
       >
         <CloseButton onClick={onClose} />
         <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap: '20px', width: '300px'}}>
            <h3 style={{textAlign: 'center', fontFamily: 'Helvetica', textTransform: 'uppercase', letterSpacing: '0.1em', color: THEME.primary}}>Admin Access</h3>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter PIN" 
              style={{
                padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', 
                color: '#fff', outline: 'none', textAlign: 'center', fontSize: '24px', letterSpacing: '5px'
              }} 
            />
            <button type="submit" style={{
              padding: '15px', background: '#fff', color: 'black', border: 'none', 
              fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase'
            }}>Unlock</button>
         </form>
       </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 500, backgroundColor: '#050505', color: '#fff', overflowY: 'auto'
      }}
    >
      <CloseButton onClick={onClose} />
      
      {/* FULL SCREEN IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000, 
                    backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
            >
                 <img 
                    src={previewImage} 
                    style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 0 30px rgba(0,0,0,0.5)'}} 
                    onClick={(e) => e.stopPropagation()} 
                 />
                 <button 
                    onClick={() => setPreviewImage(null)}
                    style={{position: 'absolute', top: 30, right: 30, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px'}}
                 >
                     <X size={32} />
                 </button>
            </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px 100px 20px' }}>
        
        {/* Admin Navigation */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '1px solid #333', gap: '5px' }}>
          <AdminTabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={MessageSquare} label="Requests" />
          <AdminTabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={ImgIcon} label="Portfolio" />
          <AdminTabButton active={activeTab === 'form'} onClick={() => setActiveTab('form')} icon={Settings} label="Form" />
          <AdminTabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="Home" />
        </div>

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em'}}>
              {bookings.length} Client Requests
            </h3>
            {bookings.length === 0 && <p style={{color: '#444'}}>No booking requests found.</p>}
            {bookings.map((booking: any, index: number) => (
              <div key={booking.id || index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '4px', position: 'relative' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(index); }} 
                    style={{ 
                        position: 'absolute', top: 15, right: 15, 
                        background: deleteConfirmIndex === index ? 'red' : 'rgba(200,0,0,0.6)', 
                        borderRadius: deleteConfirmIndex === index ? '4px' : '50%', 
                        width: deleteConfirmIndex === index ? 'auto' : '32px', 
                        height: '32px', 
                        padding: deleteConfirmIndex === index ? '0 10px' : '0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)', color: '#fff', 
                        cursor: 'pointer', zIndex: 50,
                        transition: 'all 0.2s'
                    }}
                    onMouseLeave={(e) => {
                         if (deleteConfirmIndex !== index) e.currentTarget.style.background = 'rgba(200,0,0,0.6)';
                    }}
                    onMouseEnter={(e) => {
                         if (deleteConfirmIndex !== index) e.currentTarget.style.background = 'red';
                    }}
                    title="Delete Request"
                >
                    {deleteConfirmIndex === index ? <span style={{fontSize: '10px', fontWeight: 'bold'}}>CONFIRM</span> : <Trash2 size={16} />}
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div><span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Client</span><br/>{booking.name}<br/><span style={{fontSize:'12px', color: '#888', wordBreak: 'break-all'}}>{booking.email}</span></div>
                  
                  {booking.customFields && Object.entries(booking.customFields).map(([key, val]: any) => {
                     // Exclude description from custom fields list if it is handled separately, 
                     // but here we show everything.
                     if (key === 'description') return null; // We show description separately
                     
                     const fieldConfig = formFields.find((f: any) => f.id === key);
                     const label = fieldConfig ? fieldConfig.label : key.replace(/_/g, ' ');
                     return (
                         <div key={key}>
                             <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>{label}</span>
                             <br/>
                             {val}
                         </div>
                     );
                  })}
                  
                  <div>
                    <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Received</span>
                    <br/>
                    {new Date(booking.date).toLocaleDateString()} 
                    <span style={{color: '#888', fontSize: '12px', marginLeft: '6px'}}>
                        {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '4px' }}>
                  <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Concept</span>
                  <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', fontSize: '14px', color: '#ccc' }}>{booking.description}</p>
                </div>
                 
                 {/* Images Display with Zoom Interaction */}
                 {booking.images && booking.images.length > 0 && (
                 <div style={{fontSize: '13px', color: '#aaa', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px'}}>
                    <span style={{color: '#666', fontSize: '11px', textTransform: 'uppercase', width: '100%'}}>Attached Reference Files</span>
                    {booking.images.map((img:any, idx: number) => (
                      <div 
                        key={idx} 
                        onClick={() => setPreviewImage(img.data)}
                        style={{
                            position: 'relative', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', 
                            border: '1px solid #333', cursor: 'zoom-in', transition: 'transform 0.2s', flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <img src={img.data} title={img.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'}} className="hover-overlay">
                            <Maximize2 size={20} color="#fff" />
                        </div>
                        <style>{`.hover-overlay:hover { opacity: 1 !important; }`}</style>
                      </div>
                    ))}
                 </div>
              )}
              </div>
            ))}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div>
            <div style={{marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{padding: '15px 30px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                    <Upload size={18}/> UPLOAD IMAGES
                </button>
                <input type="file" multiple ref={fileInputRef} onChange={handlePortfolioUpload} style={{display:'none'}} accept="image/png, image/jpeg" />
                <span style={{color: '#666', fontSize: '12px'}}>Max 20 files at once. Drag to reorder.</span>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px'}}>
              {portfolioImages.map((src: string, i: number) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnter={(e) => handleDragEnter(e, i)}
                    onDragEnd={handlePortfolioDragEnd}
                    onDragOver={e => e.preventDefault()}
                    style={{position: 'relative', aspectRatio: '2/3', cursor: 'move', borderRadius: '4px', overflow: 'hidden'}}
                >
                  <img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none'}} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePortfolioImage(i); }}
                    style={{position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.8)', color: 'red', border: 'none', padding: '5px', cursor: 'pointer', borderRadius: '2px', zIndex: 10}}
                  >
                    <X size={14}/>
                  </button>
                  <div style={{position: 'absolute', bottom: 5, right: 5, background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '2px'}}>
                      <Move size={12} color="#fff"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOME IMAGE TAB */}
        {activeTab === 'home' && (
            <div>
                <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '20px'}}>Homepage Background</h3>
                
                <div style={{marginBottom: '30px'}}>
                     <div style={{aspectRatio: '16/9', background: '#111', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #333'}}>
                        <img src={homeImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                     </div>
                     <button 
                        onClick={() => homeImageInputRef.current?.click()}
                        style={{padding: '15px 30px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}
                    >
                        <Upload size={18}/> CHANGE BACKGROUND
                    </button>
                    <input type="file" ref={homeImageInputRef} onChange={handleHomeImageUpload} style={{display:'none'}} accept="image/png, image/jpeg" />
                </div>
            </div>
        )}

        {/* FORM SETTINGS TAB */}
        {activeTab === 'form' && (
           <div>
             <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '20px'}}>Customize Booking Form</h3>
             
             <div id="form-builder-input" style={{background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #333'}}>
                <h4 style={{marginTop: 0, fontSize: '12px', textTransform: 'uppercase', color: editingIndex !== null ? '#bf953f' : '#888'}}>
                    {editingIndex !== null ? 'Editing Question' : 'Add New Question'}
                </h4>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <input 
                        value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} 
                        placeholder="Question (e.g. Budget)" 
                        style={{flex: 2, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none', minWidth: '200px'}}
                    />
                    <select 
                        value={newFieldType} onChange={e => setNewFieldType(e.target.value)}
                        style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none', cursor: 'pointer'}}
                    >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="radio">Multiple Choice</option>
                        <option value="select">Dropdown</option>
                    </select>
                </div>
                
                {(newFieldType === 'radio' || newFieldType === 'select') && (
                    <div style={{marginTop: '10px'}}>
                        <input 
                            value={newFieldOptions} onChange={e => setNewFieldOptions(e.target.value)} 
                            placeholder="Options (comma separated) e.g. Small, Medium, Large" 
                            style={{width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none', boxSizing: 'border-box'}}
                        />
                    </div>
                )}
                
                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                    <button onClick={saveField} style={{padding: '10px 20px', background: '#fff', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}>
                        {editingIndex !== null ? 'UPDATE' : 'ADD'}
                    </button>
                    {editingIndex !== null && (
                         <button onClick={() => { setEditingIndex(null); setNewFieldLabel(''); setNewFieldOptions(''); }} style={{padding: '10px 20px', background: 'transparent', color: '#888', border: '1px solid #444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}>
                            CANCEL
                         </button>
                    )}
                </div>
             </div>

            <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>Drag items to reorder.</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {formFields.map((field: any, i: number) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnter={(e) => handleDragEnter(e, i)}
                    onDragEnd={handleFormDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', 
                        borderRadius: '4px', cursor: 'move', transition: 'background 0.2s'
                    }}
                >
                   <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                       <GripVertical size={16} color="#666" />
                       <div>
                           <span style={{fontWeight: 500}}>{field.label}</span>
                           <span style={{fontSize: '10px', color: '#666', marginLeft: '10px', textTransform: 'uppercase'}}>{field.type}</span>
                           {(field.type === 'radio' || field.type === 'select') && (
                               <div style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>{field.options?.join(', ')}</div>
                           )}
                       </div>
                   </div>
                   <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => editField(i)} style={{background: 'none', border: 'none', color: '#aaa', cursor: 'pointer'}} title="Edit"><Edit2 size={16}/></button>
                        <button onClick={() => removeField(i)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}} title="Delete"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
            </div>
           </div>
        )}

      </div>
    </motion.div>
  );
};

const PortfolioView = ({ onClose, images }: { onClose: () => void, images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505', overflowY: 'auto'
      }}
    >
      <CloseButton onClick={onClose} />
      
      <AnimatePresence>
        {selectedImage && (
             <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                style={{
                    position: 'fixed', inset: 0, zIndex: 500, 
                    backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
            >
                 <img 
                    src={selectedImage} 
                    style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 0 30px rgba(0,0,0,0.5)'}} 
                    onClick={(e) => e.stopPropagation()} 
                 />
                 <button 
                    onClick={() => setSelectedImage(null)}
                    style={{position: 'absolute', top: 30, right: 30, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px'}}
                 >
                     <X size={32} />
                 </button>
            </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 40px' }}>
         <h2 style={{
             color: THEME.primary, 
             textAlign: 'center', 
             fontFamily: '"Playfair Display", serif', 
             fontWeight: 400, 
             letterSpacing: '0.2em', 
             textTransform: 'uppercase', 
             marginBottom: '80px',
             fontSize: 'clamp(24px, 4vw, 40px)',
             opacity: 0.9
         }}>
             Selected Works
         </h2>

         <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '40px' 
         }}>
            {images.map((src, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImage(src)}
                  style={{ 
                      aspectRatio: '3/4', 
                      cursor: 'pointer', 
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: '2px'
                  }}
                >
                    <img 
                        src={src} 
                        style={{
                            width: '100%', height: '100%', 
                            objectFit: 'cover', 
                            filter: 'grayscale(100%) brightness(0.7)',
                            transition: 'all 0.5s ease',
                            transform: 'scale(1.0)',
                            display: 'block'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.filter = 'grayscale(100%) brightness(0.7)';
                            e.currentTarget.style.transform = 'scale(1.0)';
                        }}
                    />
                </div>
            ))}
         </div>
         {images.length === 0 && <p style={{textAlign: 'center', color: '#666', fontFamily: 'Helvetica', fontWeight: 300, letterSpacing: '0.1em'}}>Portfolio is currently empty.</p>}
      </div>
    </motion.div>
  )
};

const inputStyle = {
    width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px',
    borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit'
};

const BookingView = ({ onClose, onAdminRequest, formFields, onBookingSubmit }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  
  // Secret Admin Access Logic - FIXED: Used ref to avoid render-phase updates
  const secretClicksRef = useRef(0);
  const timerRef = useRef<any>(null);

  const handleSecretClick = () => {
    secretClicksRef.current += 1;
    
    if (secretClicksRef.current >= 5) {
        onAdminRequest();
        secretClicksRef.current = 0;
    }
    
    // Reset clicks if user stops clicking for 1 second
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
        secretClicksRef.current = 0;
    }, 1000);
  };

  useEffect(() => {
      const initialData: any = {};
      formFields.forEach((field: any) => {
          if (field.type === 'checkbox') initialData[field.id] = [];
          else initialData[field.id] = '';
      });
      setFormData(initialData);
  }, [formFields]);

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  // Fixed: Enforce max 20 files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const selected = Array.from(e.target.files);
        if (selected.length > 20) {
            alert("You can upload a maximum of 20 photos. Only the first 20 will be used.");
            setFiles(selected.slice(0, 20));
        } else {
            setFiles(selected);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const processedImages = await processFiles(files);
        
        // Extract description from formData since it's now a dynamic field
        const descriptionValue = formData['description'] || '';

        const bookingData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            name: (document.getElementById('name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            description: descriptionValue,
            customFields: formData,
            images: processedImages
        };

        // Send Notification
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: 'POST',
            body: `New Booking Request from ${bookingData.name}`,
            headers: {
                'Priority': 'urgent',
                'Tags': 'tattoo,new_booking'
            }
        });

        onBookingSubmit(bookingData);
        setSubmitted(true);
    } catch (error) {
        console.error("Submission failed", error);
        alert("Something went wrong. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submitted) {
      return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}
        >
            <CloseButton onClick={onClose} />
            <CheckCircle size={60} color={THEME.primary} style={{marginBottom: '20px'}} />
            <h2 style={{fontFamily: '"Playfair Display", serif', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase'}}>Request Sent</h2>
            <p style={{color: '#888', marginTop: '10px'}}>I will review your concept and get back to you shortly.</p>
        </motion.div>
      )
  }

  return (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
            position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505', overflowY: 'auto'
        }}
    >
        <CloseButton onClick={onClose} />
        
        {/* SECRET CLICK AREA: Top Left Corner */}
        <div 
             onClick={handleSecretClick}
             style={{
                 position: 'absolute', 
                 top: 0, 
                 left: 0, 
                 width: '100px', 
                 height: '100px', 
                 zIndex: 500, // Above everything in that corner
                 cursor: 'default' 
             }}
        />

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px 20px' }}>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Full Name</label>
                    <input id="name" required type="text" style={inputStyle} placeholder="Your Name" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Email Address</label>
                    <input id="email" required type="email" style={inputStyle} placeholder="email@address.com" />
                </div>

                {/* Removed Hardcoded Description - Now handled by formFields map */}

                {formFields.map((field: any) => (
                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>{field.label}</label>
                        
                        {field.type === 'text' && (
                            <input 
                                type="text" 
                                value={formData[field.id] || ''} 
                                onChange={e => handleInputChange(field.id, e.target.value)}
                                style={inputStyle} 
                                placeholder={field.placeholder}
                            />
                        )}
                        {field.type === 'textarea' && (
                            <textarea 
                                value={formData[field.id] || ''} 
                                onChange={e => handleInputChange(field.id, e.target.value)}
                                style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} 
                                placeholder={field.placeholder}
                            />
                        )}
                        {field.type === 'select' && (
                            <div style={{position: 'relative'}}>
                                <select 
                                    value={formData[field.id] || ''} 
                                    onChange={e => handleInputChange(field.id, e.target.value)}
                                    style={{...inputStyle, appearance: 'none', cursor: 'pointer'}}
                                >
                                    <option value="" disabled>Select an option</option>
                                    {field.options?.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} color="#666" style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'}} />
                            </div>
                        )}
                         {field.type === 'radio' && (
                             <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                                 {field.options?.map((opt: string) => (
                                     <label key={opt} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ccc', fontSize: '14px'}}>
                                         <input 
                                            type="radio" 
                                            name={field.id} 
                                            value={opt}
                                            checked={formData[field.id] === opt}
                                            onChange={() => handleInputChange(field.id, opt)}
                                            style={{accentColor: '#fff'}}
                                         />
                                         {opt}
                                     </label>
                                 ))}
                             </div>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                        Reference Images (Optional)
                    </label>
                    <div 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        style={{
                            border: '1px dashed #444', padding: '20px', borderRadius: '4px', 
                            textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s',
                            background: 'rgba(255,255,255,0.02)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#888'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
                    >
                        <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                        <Upload size={24} color="#666" style={{marginBottom: '10px'}} />
                        <p style={{margin: 0, color: '#888', fontSize: '13px'}}>
                            {files.length > 0 ? `${files.length} file(s) selected (Max 20)` : "Click to upload images (Max 20)"}
                        </p>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                        marginTop: '20px', padding: '18px', background: '#fff', color: '#000', 
                        border: 'none', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', 
                        textTransform: 'uppercase', cursor: isSubmitting ? 'wait' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>

            </form>
        </div>
    </motion.div>
  )
};

// --- App ---

const App = () => {
  const [view, setView] = useState<'home' | 'portfolio' | 'booking' | 'admin'>('home');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // GLOBAL STATE (To sync between Admin and Views)
  const [bookings, setBookings] = useState<any[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>(DEFAULT_PORTFOLIO);
  const [formFields, setFormFields] = useState<any[]>(DEFAULT_FORM_FIELDS);
  const [homeImage, setHomeImage] = useState<string>(DEFAULT_MAIN_IMAGE_URL);
  
  // Lag optimization refs
  const rafRef = useRef<number | null>(null);

  // Load Data
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem('tattoo_bookings');
      if (savedBookings) setBookings(JSON.parse(savedBookings));
    } catch(e) { console.warn("LS Load Error", e); }

    try {
      const savedPortfolio = localStorage.getItem('tattoo_portfolio');
      if (savedPortfolio) setPortfolioImages(JSON.parse(savedPortfolio));
    } catch(e) { console.warn("LS Load Error", e); }

    try {
      const savedFields = localStorage.getItem('tattoo_form_fields');
      if (savedFields) {
          let parsedFields = JSON.parse(savedFields);
          
          // --- MIGRATION LOGIC (Ensure user gets new default fields) ---
          let modified = false;
          
          // 1. Remove 'color_pref' if it exists (As requested)
          if (parsedFields.some((f:any) => f.id === 'color_pref')) {
              parsedFields = parsedFields.filter((f:any) => f.id !== 'color_pref');
              modified = true;
          }

          // 2. Add 'description' if missing (As requested for form builder visibility)
          if (!parsedFields.some((f:any) => f.id === 'description')) {
              parsedFields.push({ id: 'description', label: 'Concept Description', type: 'textarea', placeholder: 'Describe your idea, placement, and any specific elements you want included.' });
              modified = true;
          }

          if (modified) {
              setFormFields(parsedFields);
              localStorage.setItem('tattoo_form_fields', JSON.stringify(parsedFields));
          } else {
              setFormFields(parsedFields);
          }
      }
    } catch(e) { console.warn("LS Load Error", e); }

    try {
      const savedHome = localStorage.getItem('tattoo_home_image');
      if (savedHome) setHomeImage(savedHome);
    } catch(e) { console.warn("LS Load Error", e); }
  }, []);

  // Optimized Mouse Move with RequestAnimationFrame and lock to reduce lag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // If a frame is already requested, skip this event
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
      rafRef.current = null;
    });
  }, []);

  // Handle Touch Move for Mobile "Flashlight"
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.setProperty('--mouse-x', `${x}px`);
          containerRef.current.style.setProperty('--mouse-y', `${y}px`);
        }
        rafRef.current = null;
      });
  }, []);


  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{ 
        position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#050505',
        // @ts-ignore
        '--mouse-x': '50vw',
        '--mouse-y': '50vh'
      }}
    >
      
      {/* BACKGROUND LAYERS - MOONLIGHT EFFECT */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
      >
        {/* Layer 1: Dark Base */}
        <div 
          style={{ 
            position: 'absolute', inset: 0,
            backgroundImage: `url(${homeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 45%',
            filter: 'grayscale(100%) brightness(0.2)',
            transition: 'filter 0.5s ease',
            willChange: 'transform' // Performance hint
          }}
        />

        {/* Layer 2: Flashlight Reveal - COLORFUL */}
        <div 
          style={{ 
            position: 'absolute', inset: 0,
            backgroundImage: `url(${homeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 45%',
            maskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)',
            filter: 'contrast(1.1) brightness(1.1)', // Clean colorful image
            willChange: 'mask-image',
            transform: 'translateZ(0)' // Force hardware acceleration
          }}
        />
      </motion.div>

      {/* UI LAYER */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        zIndex: 100
      }}>
        
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          
          {/* Top Left: Name */}
          <div 
            style={{ 
              position: 'absolute', top: '40px', left: '40px', display: 'flex', flexDirection: 'column', 
              cursor: 'pointer', zIndex: 200
            }}
          >
            <FlashlightText active={true} style={{ 
              fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 600, lineHeight: 0.9, 
              fontFamily: '"Playfair Display", serif', letterSpacing: '-0.03em', textTransform: 'uppercase'
            }}>
              tattoo
            </FlashlightText>
            <FlashlightText active={true} style={{ 
              fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.9, 
              fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em', textTransform: 'uppercase', fontStyle: 'italic'
            }}>
              .alb
            </FlashlightText>
          </div>

          {/* Top Right: Navigation */}
          <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', gap: '20px', zIndex: 200, alignItems: 'center' }}>
            <div onClick={() => setView('portfolio')}>
              <FlashlightText style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.2em' }}>
                PORTFOLIO
              </FlashlightText>
            </div>
            <div onClick={() => setView('booking')}>
               <FlashlightText style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.2em' }}>
                 BOOKING
               </FlashlightText>
            </div>
          </div>

          {/* Bottom Right: Social Icons */}
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', gap: '10px', zIndex: 200 }}>
             <SocialIcon Icon={Instagram} href="https://www.instagram.com/tattoo.alb/" label="Instagram" />
          </div>
        </div>
      </div>

      {/* OVERLAY VIEWS */}
      <AnimatePresence>
        {view === 'portfolio' && (
            <PortfolioView 
                onClose={() => setView('home')} 
                images={portfolioImages} 
            />
        )}
        {view === 'booking' && (
            <BookingView 
                onClose={() => setView('home')} 
                onAdminRequest={() => setView('admin')} 
                formFields={formFields}
                onBookingSubmit={(newBooking: any) => {
                    const updated = [newBooking, ...bookings];
                    setBookings(updated);
                    try {
                      localStorage.setItem('tattoo_bookings', JSON.stringify(updated));
                    } catch (e) { console.error("LS Save Error", e); }
                }}
            />
        )}
        {view === 'admin' && (
            <AdminView 
                onClose={() => setView('home')}
                bookings={bookings}
                setBookings={setBookings}
                portfolioImages={portfolioImages}
                setPortfolioImages={setPortfolioImages}
                formFields={formFields}
                setFormFields={setFormFields}
                homeImage={homeImage}
                setHomeImage={setHomeImage}
            />
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