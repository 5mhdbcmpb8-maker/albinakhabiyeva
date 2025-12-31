import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X, ArrowRight, Upload, FileText, Image as ImageIcon, Trash2, Lock, Plus, Settings, Image as ImgIcon, MessageSquare, CheckCircle, ChevronDown, Edit2, GripVertical, Home, Move, Maximize2, Download, RefreshCw, Smartphone, BarChart2, Activity, Users, Globe, Cloud } from 'lucide-react';

// --- CONFIGURATION ---
const DEFAULT_MAIN_IMAGE_URL = "https://i.ibb.co/PZMPwgnC/DSC08612-new-ps-2.jpg"; 

// NOTIFICATION & CLOUD CONFIGURATION (ntfy.sh)
// This topic acts as both the notification channel AND the "database"
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

const DEFAULT_FORM_FIELDS = [
  { id: 'placement', label: 'Placement', type: 'text', placeholder: 'e.g. Forearm' },
  { id: 'size', label: 'Size (cm)', type: 'text', placeholder: 'e.g. 15x8' },
  { id: 'description', label: 'Concept Description', type: 'textarea', placeholder: 'Describe your idea, placement, and any specific elements you want included.' }
];

// --- Helper Functions ---

// Aggressive Compression
const compressAndConvertToBase64 = (file: File): Promise<{name: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve({
                name: file.name,
                data: canvas.toDataURL('image/jpeg', 0.4) 
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

const FlashlightText = ({ children, className, style, onClick, active }: any) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
        <div 
            className={className} 
            onClick={onClick}
            style={{...style, color: active ? '#fff' : '#aaa', opacity: 1}}
        >
            {children}
        </div>
    );
  }

  return (
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
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), #FFFFF0 0%, #40E0D0 50%, transparent 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            opacity: 1, pointerEvents: 'none', filter: 'drop-shadow(0 0 5px #40E0D0) drop-shadow(0 0 12px #FFFFF0)',
            mixBlendMode: 'screen', willChange: 'filter', transform: 'translateZ(0)' 
        }}
        >
        {children}
        </span>
        {children}
    </div>
  );
};

const SocialIcon = ({ Icon, href, label }: { Icon: any, href: string, label?: string }) => (
  <a 
    href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    style={{ cursor: 'pointer', zIndex: 200 }}
  >
    <FlashlightText><Icon size={28} strokeWidth={1.5} /></FlashlightText>
  </a>
);

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{ 
      position: 'fixed', top: '20px', right: '20px', 
      background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
      border: `1px solid ${THEME.border}`, borderRadius: '50%',
      width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', cursor: 'pointer', zIndex: 600, transition: 'all 0.2s ease',
    }}
  >
    <X size={24} strokeWidth={1.5} />
  </button>
);

const AdminTabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '15px 5px', background: active ? '#fff' : 'rgba(255,255,255,0.05)',
      color: active ? '#000' : '#888', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
      transition: 'all 0.2s', minWidth: '60px'
    }}
  >
    <Icon size={18} /> <span>{label}</span>
  </button>
);

const compressPortfolioImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000; 
        const scaleSize = MAX_WIDTH / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  });
};

const AdminView = ({ onClose, bookings, setBookings, portfolioImages, setPortfolioImages, formFields, setFormFields, homeImage, setHomeImage }: any) => {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'analytics' | 'portfolio' | 'form' | 'settings'>('bookings');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  
  // Cloud/Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>({ totalVisits: 0, uniqueVisitors: 0, history: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form Builder State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState(''); 
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const homeImageInputRef = useRef<HTMLInputElement>(null);
  
  // Drag State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Sync Data on Load (Cloud Memory)
  useEffect(() => {
    if (authorized) {
       syncFromCloud();
    }
  }, [authorized]);

  const syncFromCloud = async () => {
    setIsSyncing(true);
    try {
        // Fetch all history from ntfy topic (acts as database)
        const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?since=all`);
        const text = await response.text();
        
        // ntfy returns newline delimited JSON
        const messages = text.trim().split('\n').map(line => {
            try { return JSON.parse(line); } catch(e) { return null; }
        }).filter(m => m !== null);

        // Process Analytics (Visits)
        const visits = messages.filter((m:any) => {
            try { 
                const body = JSON.parse(m.message); 
                return body.type === 'visit'; 
            } catch(e) { return false; }
        });

        // Process Bookings (Cloud Sync)
        const cloudBookings = messages.filter((m:any) => {
             try {
                 const body = JSON.parse(m.message);
                 return body.type === 'booking';
             } catch(e) { return false; }
        }).map((m:any) => {
             const body = JSON.parse(m.message);
             return body.data;
        });

        // Merge cloud bookings with local bookings (prevent duplicates by ID)
        const mergedBookings = [...bookings];
        cloudBookings.forEach((cloudB: any) => {
            if (!mergedBookings.some(localB => localB.id === cloudB.id)) {
                mergedBookings.push(cloudB);
            }
        });
        
        // Sort by date new to old
        mergedBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setBookings(mergedBookings);
        setAnalyticsData({
            totalVisits: visits.length,
            history: visits,
            lastSync: new Date()
        });
    } catch (e) {
        console.error("Cloud Sync Failed", e);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9702') setAuthorized(true);
    else alert('Wrong password');
  };

  const handleDeleteClick = (index: number) => {
    if (deleteConfirmIndex === index) {
        const updated = [...bookings];
        updated.splice(index, 1);
        setBookings(updated);
        try { localStorage.setItem('tattoo_bookings', JSON.stringify(updated)); } catch(e) {}
        setDeleteConfirmIndex(null);
    } else {
        setDeleteConfirmIndex(index);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const selectedFiles = Array.from(e.target.files).slice(0, 20) as File[];
        const processedImages = await Promise.all(selectedFiles.map(file => compressPortfolioImage(file)));
        const updated = [...processedImages, ...portfolioImages];
        try {
            localStorage.setItem('tattoo_portfolio', JSON.stringify(updated));
            setPortfolioImages(updated);
        } catch (e) { alert("Storage full! Delete some images."); }
      } catch (err) { alert("Upload error."); }
    }
  };

  const handleHomeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const compressedBase64 = await compressPortfolioImage(file);
        try {
            localStorage.setItem('tattoo_home_image', compressedBase64);
            setHomeImage(compressedBase64);
        } catch (e) { alert("Storage full!"); }
      } catch (err) { alert("Error uploading."); }
    }
  };

  // --- Drag Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
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

  const removePortfolioImage = (index: number) => {
    if(!window.confirm("Remove image?")) return;
    const updated = [...portfolioImages];
    updated.splice(index, 1);
    setPortfolioImages(updated);
    localStorage.setItem('tattoo_portfolio', JSON.stringify(updated));
  };

  // Form Builder Handlers
  const removeField = (index: number) => {
    if(!window.confirm("Remove question?")) return;
    const updated = [...formFields];
    updated.splice(index, 1);
    setFormFields(updated);
    localStorage.setItem('tattoo_form_fields', JSON.stringify(updated));
  };

  const saveField = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newFieldLabel) return;
    const id = newFieldLabel.toLowerCase().replace(/\s+/g, '_');
    const newField: any = { id, label: newFieldLabel, type: newFieldType, placeholder: '...' };
    if (newFieldType === 'radio' || newFieldType === 'select') {
        newField.options = newFieldOptions.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    let updated;
    if (editingIndex !== null) {
        updated = [...formFields]; updated[editingIndex] = newField; setEditingIndex(null);
    } else {
        updated = [...formFields, newField];
    }
    setFormFields(updated);
    localStorage.setItem('tattoo_form_fields', JSON.stringify(updated));
    setNewFieldLabel(''); setNewFieldOptions('');
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
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter PIN" 
              style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', outline: 'none', textAlign: 'center', fontSize: '24px', letterSpacing: '5px' }} 
            />
            <button type="submit" style={{ padding: '15px', background: '#fff', color: 'black', border: 'none', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>Unlock</button>
         </form>
       </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, backgroundColor: '#050505', color: '#fff', overflowY: 'auto' }}
    >
      <CloseButton onClick={onClose} />
      
      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            >
                 <img src={previewImage} style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 0 30px rgba(0,0,0,0.5)'}} onClick={(e) => e.stopPropagation()} />
                 <button onClick={() => setPreviewImage(null)} style={{position: 'absolute', top: 30, right: 30, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px'}}><X size={32} /></button>
            </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px 100px 20px' }}>
        
        {/* Navigation */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '1px solid #333', gap: '5px', flexWrap: 'wrap' }}>
          <AdminTabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={MessageSquare} label="Requests" />
          <AdminTabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Analytics" />
          <AdminTabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={ImgIcon} label="Portfolio" />
          <AdminTabButton active={activeTab === 'form'} onClick={() => setActiveTab('form')} icon={Settings} label="Form" />
          <AdminTabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={RefreshCw} label="System" />
        </div>

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', margin:0}}>
                {bookings.length} Requests
                </h3>
                <button 
                    onClick={syncFromCloud} 
                    disabled={isSyncing}
                    style={{background: 'none', border: '1px solid #333', color: isSyncing ? '#666' : '#fff', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'}}
                >
                    <RefreshCw size={12} className={isSyncing ? "spin" : ""} /> {isSyncing ? 'SYNCING...' : 'SYNC CLOUD'}
                </button>
            </div>

            {bookings.length === 0 && <p style={{color: '#444'}}>No requests found.</p>}
            {bookings.map((booking: any, index: number) => (
              <div key={booking.id || index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '4px', position: 'relative' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(index); }} 
                    style={{ 
                        position: 'absolute', top: 15, right: 15, 
                        background: deleteConfirmIndex === index ? 'red' : 'rgba(200,0,0,0.6)', 
                        borderRadius: deleteConfirmIndex === index ? '4px' : '50%', 
                        width: deleteConfirmIndex === index ? 'auto' : '32px', height: '32px', padding: deleteConfirmIndex === index ? '0 10px' : '0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', zIndex: 50, transition: 'all 0.2s'
                    }}
                >
                    {deleteConfirmIndex === index ? <span style={{fontSize: '10px', fontWeight: 'bold'}}>CONFIRM</span> : <Trash2 size={16} />}
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div>
                      <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Client</span><br/>{booking.name}<br/>
                      <span style={{fontSize:'12px', color: '#888', wordBreak: 'break-all'}}>{booking.email}</span>
                  </div>
                  {booking.customFields && Object.entries(booking.customFields).map(([key, val]: any) => {
                     if (key === 'description') return null; 
                     const fieldConfig = formFields.find((f: any) => f.id === key);
                     return <div key={key}><span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>{fieldConfig?.label || key}</span><br/>{val}</div>;
                  })}
                  <div>
                    <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Received</span><br/>
                    {new Date(booking.date).toLocaleDateString()} <span style={{color: '#888', fontSize: '12px'}}>{new Date(booking.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '4px' }}>
                  <span style={{color: '#666', fontSize: '10px', textTransform: 'uppercase'}}>Concept</span>
                  <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', fontSize: '14px', color: '#ccc' }}>{booking.description}</p>
                </div>
                 {booking.images && booking.images.length > 0 ? (
                 <div style={{fontSize: '13px', color: '#aaa', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px'}}>
                    {booking.images.map((img:any, idx: number) => (
                      <div key={idx} onClick={() => setPreviewImage(img.data)} style={{position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333', cursor: 'zoom-in'}}>
                        <img src={img.data} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      </div>
                    ))}
                 </div>
                 ) : (
                    <div style={{marginTop: '15px', fontSize: '11px', color: '#555', fontStyle: 'italic'}}>
                        (If images were attached on another device, check your notification app for full quality photos)
                    </div>
                 )}
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
            <div>
                 <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '30px'}}>Traffic Analytics</h3>
                 
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
                     <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '4px', textAlign: 'center'}}>
                         <Activity size={30} color={THEME.primary} style={{marginBottom: '10px'}} />
                         <div style={{fontSize: '32px', fontWeight: 'bold'}}>{analyticsData.totalVisits}</div>
                         <div style={{fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px'}}>Total Page Visits</div>
                     </div>
                     <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '4px', textAlign: 'center'}}>
                         <Users size={30} color={THEME.primary} style={{marginBottom: '10px'}} />
                         <div style={{fontSize: '32px', fontWeight: 'bold'}}>{bookings.length}</div>
                         <div style={{fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px'}}>Total Requests</div>
                     </div>
                 </div>
                 
                 <div style={{background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '4px'}}>
                     <h4 style={{marginTop: 0, fontSize: '12px', textTransform: 'uppercase', color: '#888'}}>Visitor Log (Last 50)</h4>
                     <div style={{maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                         {analyticsData.history.slice(0, 50).map((h: any, i: number) => {
                             try {
                                 const d = JSON.parse(h.message);
                                 return (
                                     <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize: '12px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid #222'}}>
                                         <span style={{color: '#aaa'}}>{new Date(h.time * 1000).toLocaleString()}</span>
                                         <span style={{color: '#fff'}}>{d.platform || 'Unknown Device'}</span>
                                     </div>
                                 )
                             } catch(e) { return null; }
                         })}
                     </div>
                 </div>
            </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div>
            <div style={{marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
                <button onClick={() => fileInputRef.current?.click()} style={{padding: '15px 30px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Upload size={18}/> UPLOAD IMAGES
                </button>
                <input type="file" multiple ref={fileInputRef} onChange={handlePortfolioUpload} style={{display:'none'}} accept="image/png, image/jpeg" />
                <span style={{color: '#666', fontSize: '12px'}}>Drag to reorder</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
              {portfolioImages.map((src: string, i: number) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnter={(e) => handleDragEnter(e, i)}
                    onDragEnd={handlePortfolioDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{position: 'relative', aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', cursor: 'move'}}
                >
                  <img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none'}} />
                  <button onClick={(e) => { e.stopPropagation(); removePortfolioImage(i); }} style={{position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.8)', color: 'red', border: 'none', padding: '5px', cursor: 'pointer', borderRadius: '2px', zIndex: 10}}><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div>
                <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '20px'}}>System & Background</h3>
                <div style={{marginBottom: '30px'}}>
                     <label style={{display:'block', marginBottom:'10px', fontSize:'12px', color:'#888'}}>Homepage Background</label>
                     <div style={{aspectRatio: '16/9', background: '#111', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #333'}}>
                        <img src={homeImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                     </div>
                     <button onClick={() => homeImageInputRef.current?.click()} style={{padding: '15px 30px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <Upload size={18}/> CHANGE BACKGROUND
                    </button>
                    <input type="file" ref={homeImageInputRef} onChange={handleHomeImageUpload} style={{display:'none'}} accept="image/png, image/jpeg" />
                </div>
            </div>
        )}

        {/* FORM CONFIG TAB */}
        {activeTab === 'form' && (
           <div>
             <h3 style={{color: THEME.primary, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '20px'}}>Form Questions</h3>
             <div style={{background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #333'}}>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} placeholder="Question (e.g. Budget)" style={{flex: 2, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none', minWidth: '200px'}} />
                    <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none', cursor: 'pointer'}}>
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="radio">Multiple Choice</option>
                        <option value="select">Dropdown</option>
                    </select>
                </div>
                {(newFieldType === 'radio' || newFieldType === 'select') && (
                    <div style={{marginTop: '10px'}}><input value={newFieldOptions} onChange={e => setNewFieldOptions(e.target.value)} placeholder="Options (comma separated)" style={{width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', outline: 'none'}} /></div>
                )}
                <button onClick={saveField} style={{marginTop:'15px', padding: '10px 20px', background: '#fff', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}>
                    {editingIndex !== null ? 'UPDATE' : 'ADD'}
                </button>
             </div>
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {formFields.map((field: any, i: number) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnter={(e) => handleDragEnter(e, i)}
                    onDragEnd={handleFormDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '4px', cursor: 'move'}}
                >
                   <div style={{display:'flex', alignItems:'center', gap:'10px'}}><GripVertical size={16} color="#666"/><span style={{fontWeight: 500}}>{field.label}</span></div>
                   <button onClick={() => removeField(i)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}} title="Delete"><Trash2 size={16}/></button>
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
      style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505', overflowY: 'auto' }}
    >
      <CloseButton onClick={onClose} />
      
      <AnimatePresence>
        {selectedImage && (
             <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 500, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            >
                 <img src={selectedImage} style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 0 30px rgba(0,0,0,0.5)'}} onClick={(e) => e.stopPropagation()} />
                 <button onClick={() => setSelectedImage(null)} style={{position: 'absolute', top: 30, right: 30, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px'}}><X size={32} /></button>
            </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px 100px 20px' }}>
         <h2 style={{
             color: THEME.primary, textAlign: 'center', 
             fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', 
             marginBottom: '60px', marginTop: '20px', fontSize: 'clamp(14px, 4vw, 18px)', opacity: 0.9
         }}>
             Selected Works
         </h2>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {images.map((src, i) => (
                <div key={i} onClick={() => setSelectedImage(src)} style={{ aspectRatio: '3/4', cursor: 'pointer', overflow: 'hidden', position: 'relative', borderRadius: '2px' }}>
                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(0.7)', transition: 'all 0.5s ease', display: 'block' }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) brightness(1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(100%) brightness(0.7)'; e.currentTarget.style.transform = 'scale(1.0)'; }}
                    />
                </div>
            ))}
         </div>
      </div>
    </motion.div>
  )
};

const inputStyle = { width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const };

const BookingView = ({ onClose, onAdminRequest, formFields, onBookingSubmit }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  
  const secretClicksRef = useRef(0);
  const timerRef = useRef<any>(null);

  const handleSecretClick = () => {
    secretClicksRef.current += 1;
    if (secretClicksRef.current >= 5) {
        onAdminRequest(); secretClicksRef.current = 0;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { secretClicksRef.current = 0; }, 1000);
  };

  useEffect(() => {
      const initialData: any = {};
      formFields.forEach((field: any) => initialData[field.id] = '');
      setFormData(initialData);
  }, [formFields]);

  const handleInputChange = (id: string, value: any) => setFormData((prev: any) => ({ ...prev, [id]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const selected = Array.from(e.target.files);
        if (selected.length > 20) { alert("Max 20 photos allowed."); setFiles(selected.slice(0, 20)); } 
        else setFiles(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const processedImages = await processFiles(files);
        const descriptionValue = formData['description'] || '';

        const bookingData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            name: (document.getElementById('name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            description: descriptionValue,
            customFields: formData,
            images: processedImages // Local/Full images
        };
        
        // Cloud Data (Images removed to save bandwidth/limit on free tier notifications)
        const cloudData = {
            ...bookingData,
            images: [] // Don't send heavy images to cloud text channel
        };

        // 1. Send to Cloud (ntfy) so Admin Panel sees it immediately
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: 'POST',
            body: JSON.stringify({ type: 'booking', data: cloudData }),
            headers: { 'Title': `New Booking: ${bookingData.name}`, 'Tags': 'tattoo,new_booking' }
        });

        // 2. Fallback Notification (Optional, ensures mobile notification appears)
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: 'POST',
            body: `New Request from ${bookingData.name}. Check Admin Panel for details.`,
            headers: { 'Priority': 'urgent' }
        });

        onBookingSubmit(bookingData);
        setSubmitted(true);
    } catch (error) {
        alert("Network error. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submitted) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <CloseButton onClick={onClose} />
            <CheckCircle size={60} color={THEME.primary} style={{marginBottom: '20px'}} />
            <h2 style={{fontFamily: '"Playfair Display", serif', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase'}}>Request Sent</h2>
            <p style={{color: '#888', textAlign: 'center', lineHeight: '1.6', maxWidth: '80%'}}>I received your request.<br/>I will check the details and contact you via email shortly.</p>
        </motion.div>
      )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: '#050505', overflowY: 'auto' }}>
        <CloseButton onClick={onClose} />
        <div onClick={handleSecretClick} style={{position: 'absolute', top: 0, left: 0, width: '80px', height: '80px', zIndex: 500}} />
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
                {formFields.map((field: any) => (
                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>{field.label}</label>
                        {field.type === 'text' && <input type="text" value={formData[field.id] || ''} onChange={e => handleInputChange(field.id, e.target.value)} style={inputStyle} placeholder={field.placeholder} />}
                        {field.type === 'textarea' && <textarea value={formData[field.id] || ''} onChange={e => handleInputChange(field.id, e.target.value)} style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} placeholder={field.placeholder} />}
                        {field.type === 'select' && (
                            <div style={{position: 'relative'}}>
                                <select value={formData[field.id] || ''} onChange={e => handleInputChange(field.id, e.target.value)} style={{...inputStyle, appearance: 'none', cursor: 'pointer'}}>
                                    <option value="" disabled>Select an option</option>
                                    {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <ChevronDown size={16} color="#666" style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'}} />
                            </div>
                        )}
                         {field.type === 'radio' && (
                             <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                                 {field.options?.map((opt: string) => (
                                     <label key={opt} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ccc', fontSize: '14px'}}>
                                         <input type="radio" name={field.id} value={opt} checked={formData[field.id] === opt} onChange={() => handleInputChange(field.id, opt)} style={{accentColor: '#fff'}} /> {opt}
                                     </label>
                                 ))}
                             </div>
                        )}
                    </div>
                ))}
                <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>Reference Images (Optional)</label>
                    <div onClick={() => document.getElementById('file-upload')?.click()} style={{border: '1px dashed #444', padding: '20px', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s', background: 'rgba(255,255,255,0.02)'}}>
                        <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                        <Upload size={24} color="#666" style={{marginBottom: '10px'}} />
                        <p style={{margin: 0, color: '#888', fontSize: '13px'}}>{files.length > 0 ? `${files.length} file(s) selected (Max 20)` : "Click to upload images"}</p>
                    </div>
                </div>
                <button type="submit" disabled={isSubmitting} style={{marginTop: '20px', padding: '18px', background: '#fff', color: '#000', border: 'none', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1}}>
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
            </form>
        </div>
    </motion.div>
  )
};

const App = () => {
  const [view, setView] = useState<'home' | 'portfolio' | 'booking' | 'admin'>('home');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>(DEFAULT_PORTFOLIO);
  const [formFields, setFormFields] = useState<any[]>(DEFAULT_FORM_FIELDS);
  const [homeImage, setHomeImage] = useState<string>(DEFAULT_MAIN_IMAGE_URL);
  
  const rafRef = useRef<number | null>(null);

  // LOG VISIT (Analytics)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('visited_v2');
    if (!hasVisited) {
        // Send lightweight tracking pixel to cloud
        fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: 'POST',
            body: JSON.stringify({ type: 'visit', platform: navigator.platform, userAgent: navigator.userAgent }),
            headers: { 'Title': 'New Visit', 'Tags': 'footprints' }
        }).catch(err => console.log('Analytics err'));
        sessionStorage.setItem('visited_v2', 'true');
    }
  }, []);

  useEffect(() => {
    try { const savedBookings = localStorage.getItem('tattoo_bookings'); if (savedBookings) setBookings(JSON.parse(savedBookings)); } catch(e) {}
    try { const savedPortfolio = localStorage.getItem('tattoo_portfolio'); if (savedPortfolio) setPortfolioImages(JSON.parse(savedPortfolio)); } catch(e) {}
    try { const savedFields = localStorage.getItem('tattoo_form_fields'); if (savedFields) setFormFields(JSON.parse(savedFields)); } catch(e) {}
    try { const savedHome = localStorage.getItem('tattoo_home_image'); if (savedHome) setHomeImage(savedHome); } catch(e) {}
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = e.clientX; const y = e.clientY;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) { containerRef.current.style.setProperty('--mouse-x', `${x}px`); containerRef.current.style.setProperty('--mouse-y', `${y}px`); }
      rafRef.current = null;
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0]; const x = touch.clientX; const y = touch.clientY;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (containerRef.current) { containerRef.current.style.setProperty('--mouse-x', `${x}px`); containerRef.current.style.setProperty('--mouse-y', `${y}px`); }
        rafRef.current = null;
      });
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      ref={containerRef} onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#050505', '--mouse-x': '50vw', '--mouse-y': '50vh' } as any}
    >
      
      {/* BACKGROUND */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        {isMobile ? (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${homeImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }} />
        ) : (
            <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${homeImage})`, backgroundSize: 'cover', backgroundPosition: '50% 45%', filter: 'grayscale(100%) brightness(0.2)', transition: 'filter 0.5s ease', willChange: 'transform' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${homeImage})`, backgroundSize: 'cover', backgroundPosition: '50% 45%', maskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%)', filter: 'contrast(1.1) brightness(1.1)', willChange: 'mask-image', transform: 'translateZ(0)' }} />
            </>
        )}
      </motion.div>

      {/* UI */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, pointerEvents: 'none' }}>
        
        <div style={{ position: 'absolute', top: isMobile ? '20px' : '40px', left: isMobile ? '20px' : '40px', display: 'flex', flexDirection: 'column', pointerEvents: 'auto', cursor: 'pointer' }}>
            <FlashlightText active={true} style={{ fontSize: 'clamp(32px, 6vw, 80px)', fontWeight: 600, lineHeight: 0.9, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>tattoo</FlashlightText>
            <FlashlightText active={true} style={{ fontSize: 'clamp(32px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.9, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em', textTransform: 'uppercase', fontStyle: 'italic' }}>.alb</FlashlightText>
        </div>

        <div style={{ position: 'absolute', top: isMobile ? 'auto' : '40px', bottom: isMobile ? '20px' : 'auto', right: isMobile ? '20px' : '40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '20px', alignItems: isMobile ? 'flex-end' : 'center', pointerEvents: 'auto' }}>
            <div onClick={() => setView('portfolio')}>
              <FlashlightText style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.2em' }}>PORTFOLIO</FlashlightText>
            </div>
            <div onClick={() => setView('booking')}>
               <FlashlightText style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.2em' }}>BOOKING</FlashlightText>
            </div>
            {!isMobile && <SocialIcon Icon={Instagram} href="https://www.instagram.com/tattoo.alb/" label="Instagram" />}
        </div>
        
        {isMobile && (
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', pointerEvents: 'auto' }}>
                <SocialIcon Icon={Instagram} href="https://www.instagram.com/tattoo.alb/" label="Instagram" />
            </div>
        )}
      </div>

      <AnimatePresence>
        {view === 'portfolio' && <PortfolioView onClose={() => setView('home')} images={portfolioImages} />}
        {view === 'booking' && (
            <BookingView 
                onClose={() => setView('home')} 
                onAdminRequest={() => setView('admin')} 
                formFields={formFields}
                onBookingSubmit={(newBooking: any) => {
                    try {
                        const updated = [newBooking, ...bookings];
                        setBookings(updated);
                        localStorage.setItem('tattoo_bookings', JSON.stringify(updated));
                    } catch(e) {}
                }}
            />
        )}
        {view === 'admin' && (
            <AdminView 
                onClose={() => setView('home')}
                bookings={bookings} setBookings={setBookings}
                portfolioImages={portfolioImages} setPortfolioImages={setPortfolioImages}
                formFields={formFields} setFormFields={setFormFields}
                homeImage={homeImage} setHomeImage={setHomeImage}
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