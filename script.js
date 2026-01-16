// ========== STATE MANAGEMENT ==========
let currentUser = { level: 3, name: 'Admin', email: 'admin@lfcgl.com' };

let siteSettings = {
    brandName: 'LFC GLORYLAND',
    heroTitle: 'GLORYLAND<br>MEDIA HUB',
    heroSubtitle: 'Access sermons, worship moments, and spiritual resources.',
    footerDescription: 'Spreading God\'s word through digital media and community outreach.',
    footerAddress: '123 Faith Street, Gloryland',
    footerPhone: '(555) 123-4567',
    footerEmail: 'info@lfcgloryland.com',
    footerCopyright: '© 2026 LFC Gloryland Media Hub. All rights reserved.',
    socialLinks: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        youtube: '#'
    }
};

let categories = [
    { id: 'cat_1', name: 'Photos', icon: 'fas fa-camera' },
    { id: 'cat_2', name: 'Videos', icon: 'fas fa-video' },
    { id: 'cat_3', name: 'Audio', icon: 'fas fa-headphones' },
    { id: 'cat_4', name: 'PDFs', icon: 'fas fa-file-pdf' }
];

let folders = [];
let files = [];
let featuredMedia = [];
let announcements = [];
let likedItems = JSON.parse(localStorage.getItem('likedItems') || '{}');
let sliderImages = [
    { id: 1, url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073" },
    { id: 2, url: "https://images.unsplash.com/photo-1543791959-12b3f543282a?q=80&w=2070" }
];
let staffMembers = [];
let sliderAnimation = 'fade';

// Default slider images - always available as fallback
const DEFAULT_SLIDER_IMAGES = [
    { id: 1, url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073" },
    { id: 2, url: "https://images.unsplash.com/photo-1543791959-12b3f543282a?q=80&w=2070" }
];

let navState = {
    view: 'categories',
    currentCatId: null,
    currentFolId: null
};

let editState = {
    type: null,
    id: null
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data with a timeout of 10 seconds
        const loadPromise = loadFromStorage();
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 10000));
        await Promise.race([loadPromise, timeoutPromise]);
    } catch (err) {
        console.error('Error during initialization:', err);
    }
    
    showPublic();
    initChart();
    applyBranding();
    renderPublicHome();
    startHeroSlider();
    updateLikesStats();
});

// ========== STORAGE FUNCTIONS ==========
async function loadFromStorage() {
    try {
        console.log('Starting data load from API...');
        
        // Load site settings from API
        try {
            console.log('Loading settings...');
            const settingsResult = await api.getSettings();
            if (settingsResult.data) {
                const data = settingsResult.data;
                // Convert snake_case from database to camelCase for JavaScript
                siteSettings = {
                    id: data.id,
                    brandName: data.brand_name,
                    heroTitle: data.hero_title,
                    heroSubtitle: data.hero_subtitle,
                    footerDescription: data.footer_description,
                    footerAddress: data.footer_address,
                    footerPhone: data.footer_phone,
                    footerEmail: data.footer_email,
                    footerCopyright: data.footer_copyright,
                    socialLinks: {
                        facebook: data.facebook_link,
                        twitter: data.twitter_link,
                        instagram: data.instagram_link,
                        youtube: data.youtube_link
                    }
                };
                console.log('Settings loaded:', siteSettings);
            }
        } catch (e) { console.log('Settings not available', e); }

        // Load categories from API
        try {
            console.log('Loading categories...');
            const catResult = await api.getCategories();
            if (catResult.data) {
                categories = catResult.data;
                console.log('Categories loaded:', categories.length);
            }
        } catch (e) { console.log('Categories not available', e); }

        // Load folders from API
        try {
            console.log('Loading folders...');
            const folResult = await api.getFolders();
            if (folResult.data) {
                folders = folResult.data;
                console.log('Folders loaded:', folders.length);
            }
        } catch (e) { console.log('Folders not available', e); }

        // Load files from API
        try {
            console.log('Loading files...');
            const fileResult = await api.getFiles();
            if (fileResult.data) {
                files = fileResult.data;
                console.log('Files loaded:', files.length);
            }
        } catch (e) { console.log('Files not available', e); }

        // Load announcements from API
        try {
            console.log('Loading announcements...');
            const annResult = await api.getAnnouncements();
            if (annResult.data) {
                announcements = annResult.data;
                console.log('Announcements loaded:', announcements.length);
            }
        } catch (e) { console.log('Announcements not available', e); }

        // Load featured media from API
        try {
            console.log('Loading featured media...');
            const featResult = await api.getFeaturedMedia();
            if (featResult.data) {
                featuredMedia = featResult.data;
                console.log('Featured media loaded:', featuredMedia.length);
            }
        } catch (e) { console.log('Featured media not available', e); }

        // Load slider images from API
        try {
            console.log('Loading slider images...');
            const sliderResult = await api.getSliderImages();
            console.log('Slider images API response:', sliderResult);
            if (sliderResult && sliderResult.data && sliderResult.data.length > 0) {
                sliderImages = sliderResult.data;
                console.log('Slider images loaded from API:', sliderImages.length);
            } else {
                sliderImages = JSON.parse(JSON.stringify(DEFAULT_SLIDER_IMAGES));
                console.log('Using defaults:', sliderImages.length);
            }
        } catch (e) { 
            console.error('Slider images error:', e);
            sliderImages = JSON.parse(JSON.stringify(DEFAULT_SLIDER_IMAGES));
        }

        // Load likes from localStorage (client-side only)
        likedItems = JSON.parse(localStorage.getItem('likedItems') || '{}');
        console.log('Data load complete!');

    } catch (err) {
        console.log('Error loading data:', err);
    }
}

async function saveToStorage(key, data) {
    try {
        if (key === 'site_settings') {
            await api.updateSettings(data);
        } else {
            // For other keys, use localStorage as fallback
            localStorage.setItem(key, JSON.stringify(data));
        }
    } catch (err) {
        console.error('Storage error:', err);
    }
}

// ========== TOAST ==========
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ========== AUTH ==========
async function attemptLogin() {
    const code = document.getElementById('adminCodeInput').value;
    
    try {
        console.log('Attempting login...');
        const result = await api.login(code);
        console.log('Login result:', result);
        
        if (result.user) {
            currentUser = result.user;
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('dashboardView').classList.remove('hidden');
            document.getElementById('currentUserRole').textContent = `Level ${currentUser.level} Admin`;
            await loadFromStorage();
            resetAdminMediaView();
            renderAdminAnnouncements();
            renderAdminSlider();
            renderAdminFeatured();
            renderHeroImagesList();
            loadBrandingForm();
            loadStaffTable();
            showToast("Welcome " + currentUser.name);
        }
    } catch (err) {
        console.error('Login error:', err);
        const input = document.getElementById('adminCodeInput');
        input.parentElement.classList.add('shake');
        setTimeout(() => input.parentElement.classList.remove('shake'), 500);
        showToast("Invalid access code");
    }
}

function showLogin() {
    document.getElementById('publicView').classList.add('hidden');
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('authView').classList.remove('hidden');
    document.getElementById('adminCodeInput').value = '';
}

function showPublic() {
    document.getElementById('authView').classList.add('hidden');
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('publicView').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// ========== VIEW SWITCHING ==========
function switchAdminSection(sectionId, btn) {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(div => div.classList.remove('active'));
    document.getElementById('admin-' + sectionId).classList.add('active');
    
    // Refresh content when switching sections
    if (sectionId === 'branding') {
        console.log('Switching to branding, loading hero images...');
        (async () => {
            try {
                const sliderResult = await api.getSliderImages();
                if (sliderResult && sliderResult.data && sliderResult.data.length > 0) {
                    sliderImages = sliderResult.data;
                    console.log('Loaded images from API:', sliderImages.length);
                } else {
                    sliderImages = JSON.parse(JSON.stringify(DEFAULT_SLIDER_IMAGES));
                    console.log('Using defaults');
                }
            } catch (e) {
                console.log('Error loading images:', e);
                sliderImages = JSON.parse(JSON.stringify(DEFAULT_SLIDER_IMAGES));
            }
            renderHeroImagesList();
        })();
    } else if (sectionId === 'media') {
        resetAdminMediaView();
        renderAdminMedia();
    } else if (sectionId === 'announcements') {
        renderAdminAnnouncements();
    } else if (sectionId === 'featured') {
        renderAdminFeatured();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    showToast(isDark ? "Dark Mode Enabled" : "Light Mode Enabled");
}

// ========== BRANDING ==========
function applyBranding() {
    document.getElementById('headerBrandName').textContent = siteSettings.brandName;
    document.getElementById('heroTitle').innerHTML = siteSettings.heroTitle;
    document.getElementById('heroSubtitle').textContent = siteSettings.heroSubtitle;
    document.getElementById('footerBrandName').textContent = siteSettings.brandName;
    document.getElementById('footerDescription').textContent = siteSettings.footerDescription;
    document.getElementById('footerAddress').textContent = siteSettings.footerAddress;
    document.getElementById('footerPhone').textContent = siteSettings.footerPhone;
    document.getElementById('footerEmail').textContent = siteSettings.footerEmail;
    document.getElementById('footerCopyright').textContent = siteSettings.footerCopyright;

    // Social links
    if (siteSettings.socialLinks.facebook) document.getElementById('facebookLink').href = siteSettings.socialLinks.facebook;
    if (siteSettings.socialLinks.twitter) document.getElementById('twitterLink').href = siteSettings.socialLinks.twitter;
    if (siteSettings.socialLinks.instagram) document.getElementById('instagramLink').href = siteSettings.socialLinks.instagram;
    if (siteSettings.socialLinks.youtube) document.getElementById('youtubeLink').href = siteSettings.socialLinks.youtube;
}

async function loadBrandingForm() {
    console.log('Loading branding form, sliderImages count:', sliderImages.length);
    
    document.getElementById('brandName').value = siteSettings.brandName;
    document.getElementById('heroTitleInput').value = siteSettings.heroTitle.replace('<br>', ' ');
    document.getElementById('heroSubtitleInput').value = siteSettings.heroSubtitle;
    document.getElementById('footerDesc').value = siteSettings.footerDescription;
    document.getElementById('footerAddr').value = siteSettings.footerAddress;
    document.getElementById('footerPh').value = siteSettings.footerPhone;
    document.getElementById('footerEm').value = siteSettings.footerEmail;
    document.getElementById('footerCopy').value = siteSettings.footerCopyright;
    document.getElementById('fbLink').value = siteSettings.socialLinks.facebook;
    document.getElementById('twLink').value = siteSettings.socialLinks.twitter;
    document.getElementById('igLink').value = siteSettings.socialLinks.instagram;
    document.getElementById('ytLink').value = siteSettings.socialLinks.youtube;
    
    // Render hero images list
    console.log('Rendering hero images list...');
    renderHeroImagesList();
}

async function saveBranding() {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can edit branding");
    }
    
    siteSettings.brandName = document.getElementById('brandName').value;
    siteSettings.heroTitle = document.getElementById('heroTitleInput').value;
    siteSettings.heroSubtitle = document.getElementById('heroSubtitleInput').value;
    siteSettings.footerDescription = document.getElementById('footerDesc').value;
    siteSettings.footerAddress = document.getElementById('footerAddr').value;
    siteSettings.footerPhone = document.getElementById('footerPh').value;
    siteSettings.footerEmail = document.getElementById('footerEm').value;
    siteSettings.footerCopyright = document.getElementById('footerCopy').value;
    siteSettings.socialLinks.facebook = document.getElementById('fbLink').value;
    siteSettings.socialLinks.twitter = document.getElementById('twLink').value;
    siteSettings.socialLinks.instagram = document.getElementById('igLink').value;
    siteSettings.socialLinks.youtube = document.getElementById('ytLink').value;

    try {
        // Convert camelCase to snake_case for database
        const settingsData = {
            id: siteSettings.id || 1,
            brand_name: siteSettings.brandName,
            hero_title: siteSettings.heroTitle,
            hero_subtitle: siteSettings.heroSubtitle,
            footer_description: siteSettings.footerDescription,
            footer_address: siteSettings.footerAddress,
            footer_phone: siteSettings.footerPhone,
            footer_email: siteSettings.footerEmail,
            footer_copyright: siteSettings.footerCopyright,
            facebook_link: siteSettings.socialLinks.facebook,
            twitter_link: siteSettings.socialLinks.twitter,
            instagram_link: siteSettings.socialLinks.instagram,
            youtube_link: siteSettings.socialLinks.youtube
        };
        
        const result = await api.updateSettings(settingsData);
        console.log('Settings saved:', result);
        applyBranding();
        showToast("Branding updated successfully!");
    } catch (err) {
        console.error('Error updating branding:', err);
        showToast("Error updating branding: " + (err.message || 'Unknown error'));
    }
}

// ========== HERO IMAGE MANAGEMENT ==========
function renderHeroImagesList() {
    const container = document.getElementById('heroImagesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (sliderImages.length === 0) {
        container.innerHTML = '<p class="text-muted">No hero images uploaded yet.</p>';
        return;
    }
    
    sliderImages.forEach((img, index) => {
        container.innerHTML += `
            <div class="file-card">
                <img src="${img.url}" class="file-preview">
                <div class="file-info">
                    <div class="item-title">Slide ${index + 1}</div>
                    <button onclick="removeHeroImage(${img.id})" class="btn btn-danger btn-sm" style="width:100%; margin-top: 10px;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>`;
    });
}

async function uploadHeroImages() {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can upload hero images");
    }
    
    const input = document.getElementById('heroImageUpload');
    if (!input.files.length) {
        return showToast("Please select images to upload");
    }
    
    try {
        const uploadedCount = input.files.length;
        
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const reader = new FileReader();
            
            await new Promise((resolve, reject) => {
                reader.onerror = () => {
                    console.error('FileReader error:', reader.error);
                    reject(reader.error);
                };
                
                reader.onload = async function (e) {
                    const imageData = e.target.result;
                    console.log('File size:', file.size, 'File type:', file.type);
                    console.log('Base64 length:', imageData.length);
                    
                    const imageObj = { 
                        url: imageData
                    };
                    
                    // Save to API
                    try {
                        console.log('Uploading image to API...');
                        const result = await api.createSliderImage(imageObj);
                        console.log('Slider image API response:', result);
                        
                        if (result && result.data && result.data.length > 0) {
                            const savedImage = result.data[0];
                            console.log('Image saved successfully with ID:', savedImage.id);
                            if (!sliderImages.find(img => img.id === savedImage.id)) {
                                sliderImages.push(savedImage);
                            }
                        } else {
                            console.warn('Unexpected API response format:', result);
                            sliderImages.push(imageObj);
                        }
                    } catch (err) {
                        console.error('Error saving slider image:', err);
                        showToast('Error saving slider image: ' + err.message);
                        reject(err);
                    }
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Wait a moment for database to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload from API to ensure consistency
        console.log('Reloading slider images from API...');
        const sliderResult = await api.getSliderImages();
        console.log('Reload result:', sliderResult);
        if (sliderResult && sliderResult.data) {
            sliderImages = sliderResult.data;
            console.log('Reloaded slider images count:', sliderImages.length);
        }
        
        renderHeroImagesList();
        renderAdminSlider();
        showToast(`${uploadedCount} hero image(s) uploaded!`);
        input.value = '';
    } catch (err) {
        console.error('Error uploading hero images:', err);
        showToast("Error uploading hero images: " + err.message);
        // Reload from API to get correct state
        await loadFromStorage();
        renderHeroImagesList();
    }
}

async function removeHeroImage(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can remove hero images");
    }
    
    if (!confirm("Remove this hero image?")) return;
    
    try {
        console.log('Removing hero image with ID:', id);
        await api.deleteSliderImage(id);
        
        // Remove from local state
        sliderImages = sliderImages.filter(s => s.id !== id);
        
        // Reload from API to ensure consistency
        const sliderResult = await api.getSliderImages();
        if (sliderResult.data) {
            sliderImages = sliderResult.data;
            console.log('Reloaded slider images after deletion:', sliderImages);
        }
        
        renderHeroImagesList();
        renderAdminSlider();
        showToast("Hero image removed");
    } catch (err) {
        console.error('Error removing slider image:', err);
        showToast("Error removing hero image");
        // Reload from API to get correct state
        await loadFromStorage();
        renderHeroImagesList();
    }
}

// ========== MEDIA LIBRARY ==========
function renderAdminMedia() {
    const container = document.getElementById('adminMediaContent');
    const breadcrumbs = document.getElementById('adminBreadcrumbs');
    const addBtn = document.getElementById('addBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const input = document.getElementById('newItemInput');

    container.innerHTML = '';

    if (navState.view === 'categories') {
        breadcrumbs.innerHTML = `<span>Categories</span>`;
        input.placeholder = "New Category Name...";
        input.classList.remove('hidden');
        addBtn.classList.remove('hidden');
        uploadBtn.classList.add('hidden');
        addFolderBtn.classList.add('hidden');

        categories.forEach(cat => {
            container.innerHTML += `
                <div class="item-card-wrapper">
                    <div class="item-card" onclick="enterCategory('${cat.id}')">
                        <i class="${cat.icon} item-icon"></i>
                        <div class="item-title">${cat.name}</div>
                        <div class="item-meta">${folders.filter(f => f.category_id === cat.id).length} Folders</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-icon-only" onclick="event.stopPropagation(); editItem('category', '${cat.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon-only" onclick="event.stopPropagation(); deleteCategory('${cat.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
    } else if (navState.view === 'folders') {
        const cat = categories.find(c => c.id === navState.currentCatId);
        breadcrumbs.innerHTML = `<span onclick="resetAdminMediaView()">Categories</span> <span>${cat.name}</span>`;
        input.placeholder = "New Folder Name...";
        input.classList.remove('hidden');
        addBtn.classList.remove('hidden');
        uploadBtn.classList.add('hidden');
        addFolderBtn.classList.add('hidden');

        const currentFolders = folders.filter(f => f.category_id === navState.currentCatId);
        if (currentFolders.length === 0) container.innerHTML = '<p class="text-muted">No folders yet.</p>';

        currentFolders.forEach(fol => {
            container.innerHTML += `
                <div class="item-card-wrapper">
                    <div class="item-card" onclick="enterFolder('${fol.id}')">
                        <i class="fas fa-folder item-icon" style="color:#fbbf24"></i>
                        <div class="item-title">${fol.name}</div>
                        <div class="item-meta">${files.filter(f => f.folder_id === fol.id).length} Files</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-icon-only" onclick="event.stopPropagation(); editItem('folder', '${fol.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon-only" onclick="event.stopPropagation(); deleteFolder('${fol.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
    } else if (navState.view === 'files') {
        const cat = categories.find(c => c.id === navState.currentCatId);
        const fol = folders.find(f => f.id === navState.currentFolId);
        breadcrumbs.innerHTML = `<span onclick="resetAdminMediaView()">Categories</span> <span onclick="enterCategory('${cat.id}')">${cat.name}</span> <span>${fol.name}</span>`;

        input.classList.add('hidden');
        addBtn.classList.add('hidden');
        uploadBtn.classList.remove('hidden');
        addFolderBtn.classList.remove('hidden');

        const currentFiles = files.filter(f => f.folder_id === navState.currentFolId);
        if (currentFiles.length === 0) container.innerHTML = '<p class="text-muted">No files uploaded.</p>';

        currentFiles.forEach(file => {
            const cat = categories.find(c => c.id === navState.currentCatId);
            container.innerHTML += renderFileCard(file, cat.name, true);
        });
    }
}

function renderFileCard(file, categoryName, isAdmin = false) {
    const isLiked = likedItems[file.id] || false;
    const likeIcon = isLiked ? 'fas fa-heart' : 'far fa-heart';
    const likeClass = isLiked ? 'liked' : '';
    
    // Determine file type
    const fileType = getFileType(file);
    
    // For Audio files - List view
    if (fileType === 'audio') {
        return renderAudioListItem(file, isLiked, likeIcon, likeClass, isAdmin);
    }
    
    // For Video files - Grid with player
    if (fileType === 'video') {
        return renderVideoCard(file, isLiked, likeIcon, likeClass, isAdmin);
    }
    
    // For PDF files - Grid with preview
    if (fileType === 'pdf') {
        return renderPDFCard(file, isLiked, likeIcon, likeClass, isAdmin);
    }
    
    // Default for images
    const actions = isAdmin ? `
        <div class="file-actions">
            <button class="btn btn-sm btn-icon-text" onclick="editItem('file', '${file.id}')" title="Rename">
                <i class="fas fa-edit"></i> Rename
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.id}')" title="Delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    ` : `
        <div class="media-interactions">
            <button class="interaction-btn ${likeClass}" onclick="event.stopPropagation(); likeMedia('${file.id}', 'file')">
                <i class="${likeIcon}"></i> <span id="like-count-${file.id}">${file.likes || 0}</span>
            </button>
            <a href="${file.url}" download class="interaction-btn" onclick="event.stopPropagation()">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `;

    return `
        <div class="file-card" onclick="${isAdmin ? '' : `openMediaDetail('${file.id}', '${categoryName}')`}">
            <div class="file-thumbnail-container">
                <img src="${file.thumbnail || file.url}" class="file-preview" onerror="this.src='https://via.placeholder.com/300x200?text=File'">
                ${isAdmin ? `<button class="thumbnail-change-btn" onclick="event.stopPropagation(); changeThumbnail('${file.id}')" title="Change thumbnail">
                    <i class="fas fa-camera"></i>
                </button>` : ''}
            </div>
            <div class="file-info">
                <div class="item-title">${file.name}</div>
                ${file.tags ? `<div class="file-tags">${file.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
                ${actions}
            </div>
        </div>`;
}

function getFileType(file) {
    const type = file.type || '';
    const name = file.name || '';
    
    if (type.includes('audio') || /\.(mp3|wav|ogg|m4a)$/i.test(name)) return 'audio';
    if (type.includes('video') || /\.(mp4|webm|mov|avi)$/i.test(name)) return 'video';
    if (type.includes('pdf') || /\.pdf$/i.test(name)) return 'pdf';
    return 'image';
}

function renderAudioListItem(file, isLiked, likeIcon, likeClass, isAdmin) {
    const uploadDate = file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : 'Unknown';
    const author = file.uploadedBy || 'Unknown Artist';
    
    const actions = isAdmin ? `
        <button class="btn btn-sm btn-icon-text" onclick="event.stopPropagation(); editItem('file', '${file.id}')" title="Rename">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteFile('${file.id}')" title="Delete">
            <i class="fas fa-trash"></i>
        </button>
    ` : `
        <button class="interaction-btn-icon ${likeClass}" onclick="event.stopPropagation(); likeMedia('${file.id}', 'file')" title="Like">
            <i class="${likeIcon}"></i> <span id="like-count-${file.id}">${file.likes || 0}</span>
        </button>
        <a href="${file.url}" download class="interaction-btn-icon" onclick="event.stopPropagation()" title="Download">
            <i class="fas fa-download"></i>
        </a>
    `;
    
    return `
        <div class="audio-list-item">
            <div class="audio-play-section">
                <button class="audio-play-btn" onclick="event.stopPropagation(); playAudioPreview('${file.id}', '${file.url}')" id="play-btn-${file.id}">
                    <i class="fas fa-play"></i>
                </button>
                <audio id="audio-${file.id}" src="${file.url}" preload="metadata"></audio>
            </div>
            <div class="audio-info-section">
                <div class="audio-title">${file.name}</div>
                <div class="audio-meta">
                    <span><i class="fas fa-user"></i> ${author}</span>
                    <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                    ${file.tags ? `<span><i class="fas fa-tag"></i> ${file.tags.split(',')[0].trim()}</span>` : ''}
                </div>
            </div>
            <div class="audio-actions">
                ${actions}
            </div>
        </div>`;
}

function renderVideoCard(file, isLiked, likeIcon, likeClass, isAdmin) {
    const actions = isAdmin ? `
        <div class="file-actions">
            <button class="btn btn-sm btn-icon-text" onclick="editItem('file', '${file.id}')" title="Rename">
                <i class="fas fa-edit"></i> Rename
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.id}')" title="Delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    ` : `
        <div class="media-interactions">
            <button class="interaction-btn ${likeClass}" onclick="event.stopPropagation(); likeMedia('${file.id}', 'file')">
                <i class="${likeIcon}"></i> <span id="like-count-${file.id}">${file.likes || 0}</span>
            </button>
            <a href="${file.url}" download class="interaction-btn" onclick="event.stopPropagation()">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `;
    
    return `
        <div class="file-card video-card">
            <div class="video-container">
                <video class="video-preview" src="${file.url}" preload="metadata" 
                       onmouseover="this.play()" onmouseout="this.pause(); this.currentTime=0;"
                       onclick="event.stopPropagation(); openVideoPlayer('${file.id}', '${file.url}', '${file.name}')">
                </video>
                <div class="video-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
                ${isAdmin ? `<button class="thumbnail-change-btn" onclick="event.stopPropagation(); changeThumbnail('${file.id}')" title="Change thumbnail">
                    <i class="fas fa-camera"></i>
                </button>` : ''}
            </div>
            <div class="file-info">
                <div class="item-title">${file.name}</div>
                ${file.tags ? `<div class="file-tags">${file.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
                ${actions}
            </div>
        </div>`;
}

function renderPDFCard(file, isLiked, likeIcon, likeClass, isAdmin) {
    const actions = isAdmin ? `
        <div class="file-actions">
            <button class="btn btn-sm btn-icon-text" onclick="editItem('file', '${file.id}')" title="Rename">
                <i class="fas fa-edit"></i> Rename
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.id}')" title="Delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    ` : `
        <div class="media-interactions">
            <button class="interaction-btn ${likeClass}" onclick="event.stopPropagation(); likeMedia('${file.id}', 'file')">
                <i class="${likeIcon}"></i> <span id="like-count-${file.id}">${file.likes || 0}</span>
            </button>
            <button class="interaction-btn" onclick="event.stopPropagation(); openPDFViewer('${file.id}', '${file.url}', '${file.name}')">
                <i class="fas fa-eye"></i> Quick View
            </button>
            <a href="${file.url}" download class="interaction-btn" onclick="event.stopPropagation()">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `;
    
    return `
        <div class="file-card pdf-card">
            <div class="file-thumbnail-container">
                <img src="${file.thumbnail || 'https://via.placeholder.com/300x200?text=PDF'}" class="file-preview">
                <div class="pdf-icon-overlay">
                    <i class="fas fa-file-pdf"></i>
                </div>
                ${isAdmin ? `<button class="thumbnail-change-btn" onclick="event.stopPropagation(); changeThumbnail('${file.id}')" title="Change thumbnail">
                    <i class="fas fa-camera"></i>
                </button>` : ''}
            </div>
            <div class="file-info">
                <div class="item-title">${file.name}</div>
                ${file.tags ? `<div class="file-tags">${file.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
                ${actions}
            </div>
        </div>`;
}

function resetAdminMediaView() {
    navState = { view: 'categories', currentCatId: null, currentFolId: null };
    renderAdminMedia();
}

function enterCategory(id) {
    navState.view = 'folders';
    navState.currentCatId = id;
    renderAdminMedia();
}

function enterFolder(id) {
    navState.view = 'files';
    navState.currentFolId = id;
    renderAdminMedia();
}

function handleAddItem() {
    if (currentUser.level < 1) {
        return showToast("You don't have permission to add items");
    }
    
    const name = document.getElementById('newItemInput').value.trim();
    if (!name) return showToast("Please enter a name");

    if (navState.view === 'categories') {
        const newCat = { id: 'cat_' + Date.now(), name: name, icon: 'fas fa-layer-group' };
        categories.push(newCat);
        api.createCategory(newCat).catch(err => showToast("Error creating category"));
    } else if (navState.view === 'folders') {
        if (currentUser.level < 1) {
            return showToast("You need Level 1+ permission");
        }
        const newFol = { id: 'fol_' + Date.now(), category_id: navState.currentCatId, name: name };
        folders.push(newFol);
        api.createFolder(newFol).catch(err => showToast("Error creating folder"));
    }

    document.getElementById('newItemInput').value = '';
    showToast("Created Successfully");
    renderAdminMedia();
}

async function handleFileUpload(input) {
    if (currentUser.level < 1) {
        return showToast("You need Level 1+ permission to upload files");
    }
    
    if (input.files.length === 0) return;

    const needsApproval = currentUser.level === 1;
    
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();

        await new Promise((resolve) => {
            reader.onload = async function (e) {
                const fileId = 'file_' + Date.now() + '_' + i;
                const fileObj = {
                    id: fileId,
                    folder_id: navState.currentFolId,
                    category_id: navState.currentCatId,
                    name: file.name,
                    type: file.type,
                    url: e.target.result,
                    thumbnail: e.target.result,
                    upload_date: new Date().toISOString(),
                    likes: 0,
                    tags: '',
                    approved: !needsApproval,
                    uploaded_by: currentUser.name
                };

                files.push(fileObj);
                // Save to API (Supabase)
                try {
                    await api.createFile(fileObj);
                } catch (err) {
                    console.error('Error saving file to database:', err);
                    showToast('Error uploading file to database');
                    files = files.filter(f => f.id !== fileId); // Remove from local state on error
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    const message = needsApproval 
        ? `${input.files.length} Files Uploaded - Pending Approval` 
        : `${input.files.length} Files Uploaded`;
    showToast(message);
    input.value = '';
    renderAdminMedia();
    renderPublicContent();
}

// ========== EDIT/DELETE ==========
function editItem(type, id) {
    editState = { type, id };
    let item, title;

    if (type === 'category') {
        item = categories.find(c => c.id === id);
        title = 'Edit Category Name';
    } else if (type === 'folder') {
        item = folders.find(f => f.id === id);
        title = 'Edit Folder Name';
    } else if (type === 'file') {
        item = files.find(f => f.id === id);
        title = 'Edit File Name';
    }

    if (!item) return;

    document.getElementById('editModalTitle').textContent = title;
    document.getElementById('editItemInput').value = item.name;
    document.getElementById('editModal').classList.remove('hidden');
}

async function saveEdit() {
    const newName = document.getElementById('editItemInput').value.trim();
    if (!newName) return showToast("Please enter a name");

    try {
        if (editState.type === 'category') {
            const cat = categories.find(c => c.id === editState.id);
            if (cat) {
                cat.name = newName;
                await api.updateCategory(editState.id, { name: newName });
                renderAdminMedia();
            }
        } else if (editState.type === 'folder') {
            const fol = folders.find(f => f.id === editState.id);
            if (fol) {
                fol.name = newName;
                await api.updateFolder(editState.id, { name: newName });
                renderAdminMedia();
            }
        } else if (editState.type === 'file') {
            const file = files.find(f => f.id === editState.id);
            if (file) {
                file.name = newName;
                await api.updateFile(editState.id, { name: newName });
                renderAdminMedia();
                renderPublicContent();
            }
        }

        showToast("Updated successfully");
        closeEditModal();
    } catch (err) {
        console.error('Error updating item:', err);
        showToast("Error updating item");
        // Reload to get current state from API
        await loadFromStorage();
        renderAdminMedia();
        renderPublicContent();
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editState = { type: null, id: null };
}

async function deleteCategory(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can delete categories");
    }
    
    const cat = categories.find(c => c.id === id);
    const folderCount = folders.filter(f => f.category_id === id).length;

    if (folderCount > 0) {
        if (!confirm(`"${cat.name}" contains ${folderCount} folder(s). Delete anyway?`)) return;
        
        const folderIds = folders.filter(f => f.category_id === id).map(f => f.id);
        for (const folderId of folderIds) {
            const fileIds = files.filter(f => f.folder_id === folderId).map(f => f.id);
            for (const fileId of fileIds) {
                try { await api.deleteFile(fileId); } catch (e) { }
            }
            files = files.filter(f => !fileIds.includes(f.id));
        }
        folders = folders.filter(f => f.category_id !== id);
    } else {
        if (!confirm(`Delete category "${cat.name}"?`)) return;
    }

    try {
        await api.deleteCategory(id);
        categories = categories.filter(c => c.id !== id);
        renderAdminMedia();
        showToast("Category deleted");
    } catch (err) {
        showToast("Error deleting category");
    }
}

async function deleteFolder(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can delete folders");
    }
    
    const fol = folders.find(f => f.id === id);
    const fileCount = files.filter(f => f.folder_id === id).length;

    if (fileCount > 0) {
        if (!confirm(`"${fol.name}" contains ${fileCount} file(s). Delete anyway?`)) return;
        
        const fileIds = files.filter(f => f.folder_id === id).map(f => f.id);
        for (const fileId of fileIds) {
            try { await api.deleteFile(fileId); } catch (e) { }
        }
        files = files.filter(f => !fileIds.includes(f.id));
    } else {
        if (!confirm(`Delete folder "${fol.name}"?`)) return;
    }

    try {
        await api.deleteFolder(id);
        folders = folders.filter(f => f.id !== id);
        renderAdminMedia();
        renderPublicContent();
        showToast("Folder deleted");
    } catch (err) {
        showToast("Error deleting folder");
    }
}

async function deleteFile(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can delete files");
    }
    
    if (!confirm("Delete this file permanently?")) return;
    
    try {
        await api.deleteFile(id);
        files = files.filter(f => f.id !== id);
        renderAdminMedia();
        renderPublicContent();
        showToast("File Deleted");
    } catch (err) {
        showToast("Error deleting file");
    }
}

// ========== FOLDER MODAL ==========
function showAddFolderDialog() {
    document.getElementById('folderModal').classList.remove('hidden');
}

function closeFolderModal() {
    document.getElementById('folderModal').classList.add('hidden');
    document.getElementById('newFolderInput').value = '';
}

async function createFolderInFiles() {
    const name = document.getElementById('newFolderInput').value.trim();
    if (!name) return showToast("Please enter a folder name");

    const newFol = { id: 'fol_' + Date.now(), category_id: navState.currentCatId, name: name };
    folders.push(newFol);
    
    try {
        await api.createFolder(newFol);
        showToast("Folder created successfully");
        closeFolderModal();
        renderAdminMedia();
    } catch (err) {
        console.error('Error creating folder:', err);
        folders = folders.filter(f => f.id !== newFol.id);
        showToast("Error creating folder");
    }
}

// ========== THUMBNAIL ==========
let currentThumbnailFileId = null;

function changeThumbnail(fileId) {
    currentThumbnailFileId = fileId;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleThumbnailUpload;
    input.click();
}

async function handleThumbnailUpload(e) {
    if (!e.target.files.length || !currentThumbnailFileId) return;

    const file = files.find(f => f.id === currentThumbnailFileId);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (ev) {
        file.thumbnail = ev.target.result;
        await saveToStorage(file.id, file);
        renderAdminMedia();
        renderPublicContent();
        showToast("Thumbnail updated");
        currentThumbnailFileId = null;
    };

    reader.readAsDataURL(e.target.files[0]);
}

// ========== PUBLIC VIEW ==========
function resetPublicView() {
    navState = { view: 'categories', currentCatId: null, currentFolId: null };
    renderPublicContent();
}

function renderPublicContent() {
    const container = document.getElementById('publicContentArea');
    const breadcrumbs = document.getElementById('publicBreadcrumbs');
    container.innerHTML = '';

    if (navState.view === 'categories') {
        breadcrumbs.innerHTML = `<span>Library</span>`;
        categories.forEach(cat => {
            container.innerHTML += `
                <div class="item-card" onclick="publicEnterCategory('${cat.id}')">
                    <i class="${cat.icon} item-icon"></i>
                    <div class="item-title">${cat.name}</div>
                </div>`;
        });
    } else if (navState.view === 'folders') {
        const cat = categories.find(c => c.id === navState.currentCatId);
        breadcrumbs.innerHTML = `<span onclick="resetPublicView()">Library</span> <span>${cat.name}</span>`;
        const currentFolders = folders.filter(f => f.category_id === navState.currentCatId);
        
        currentFolders.forEach(fol => {
            container.innerHTML += `
                <div class="item-card" onclick="publicEnterFolder('${fol.id}')">
                    <i class="fas fa-folder item-icon" style="color:#fbbf24"></i>
                    <div class="item-title">${fol.name}</div>
                </div>`;
        });
    } else if (navState.view === 'files') {
        const cat = categories.find(c => c.id === navState.currentCatId);
        const fol = folders.find(f => f.id === navState.currentFolId);
        breadcrumbs.innerHTML = `<span onclick="resetPublicView()">Library</span> <span onclick="publicEnterCategory('${cat.id}')">${cat.name}</span> <span>${fol.name}</span>`;
        
        const currentFiles = files.filter(f => f.folder_id === navState.currentFolId);
        
        // Check if files are audio
        const hasAudio = currentFiles.some(f => getFileType(f) === 'audio');
        
        if (hasAudio) {
            container.className = 'list-layout';
        } else {
            container.className = 'pinterest-grid';
        }
        
        if (currentFiles.length === 0) container.innerHTML = '<p>No files here yet.</p>';

        currentFiles.forEach(file => {
            container.innerHTML += renderFileCard(file, cat.name, false);
        });
    }
}

function publicEnterCategory(id) {
    navState.view = 'folders';
    navState.currentCatId = id;
    renderPublicContent();
}

function publicEnterFolder(id) {
    navState.view = 'files';
    navState.currentFolId = id;
    renderPublicContent();
}

// ========== FEATURED MEDIA ==========
function renderAdminFeatured() {
    const container = document.getElementById('adminFeaturedGrid');
    container.innerHTML = '';

    if (featuredMedia.length === 0) {
        container.innerHTML = '<p class="text-muted">No featured items yet.</p>';
        return;
    }

    featuredMedia.forEach(item => {
        container.innerHTML += `
            <div class="file-card">
                <img src="${item.url}" class="file-preview">
                <div class="file-info">
                    <div class="item-title">${item.title}</div>
                    <p style="font-size:0.85rem; color:var(--text-muted)">${item.description}</p>
                    <div class="file-actions">
                        <button class="btn btn-danger btn-sm" onclick="deleteFeatured('${item.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

function renderFeaturedMedia() {
    const container = document.getElementById('featuredMediaGrid');
    container.innerHTML = '';

    if (featuredMedia.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;">No featured media yet.</p>';
        return;
    }

    featuredMedia.forEach(item => {
        const isLiked = likedItems[item.id] || false;
        const likeIcon = isLiked ? 'fas fa-heart' : 'far fa-heart';
        const likeClass = isLiked ? 'liked' : '';
        
        container.innerHTML += `
            <div class="featured-card" onclick="openMediaDetail('${item.id}', 'featured')">
                <img src="${item.url}" class="featured-image">
                <div class="featured-overlay">
                    <div class="featured-title">${item.title}</div>
                    <div class="media-interactions">
                        <button class="interaction-btn ${likeClass}" onclick="event.stopPropagation(); likeMedia('${item.id}', 'featured')">
                            <i class="${likeIcon}"></i> <span id="like-count-${item.id}">${item.likes || 0}</span>
                        </button>
                        <a href="${item.url}" download class="interaction-btn" onclick="event.stopPropagation()">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                </div>
            </div>`;
    });
}

function showAddFeaturedModal() {
    document.getElementById('featuredModal').classList.remove('hidden');
}

function closeFeaturedModal() {
    document.getElementById('featuredModal').classList.add('hidden');
    document.getElementById('featuredTitle').value = '';
    document.getElementById('featuredDesc').value = '';
    document.getElementById('featuredFile').value = '';
    document.getElementById('featuredTags').value = '';
}

async function saveFeaturedItem() {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can add featured media");
    }
    
    const title = document.getElementById('featuredTitle').value.trim();
    const desc = document.getElementById('featuredDesc').value.trim();
    const tags = document.getElementById('featuredTags').value.trim();
    const fileInput = document.getElementById('featuredFile');

    if (!title || !fileInput.files.length) {
        return showToast("Please provide title and file");
    }

    try {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const itemId = 'featured_' + Date.now();
            const item = {
                id: itemId,
                title,
                description: desc,
                url: e.target.result,
                tags,
                likes: 0,
                upload_date: new Date().toISOString()
            };

            try {
                const result = await api.createFeaturedMedia(item);
                console.log('Featured item saved:', result);
                
                // Update with returned data if available
                if (result.data && result.data.length > 0) {
                    // Find and update the item in the array
                    const index = featuredMedia.findIndex(f => f.id === itemId);
                    if (index !== -1) {
                        featuredMedia[index] = result.data[0];
                    } else {
                        featuredMedia.push(result.data[0]);
                    }
                } else {
                    featuredMedia.push(item);
                }
                
                renderAdminFeatured();
                renderFeaturedMedia();
                showToast("Added to featured!");
                closeFeaturedModal();
            } catch (err) {
                console.error('Error saving featured item:', err);
                featuredMedia = featuredMedia.filter(f => f.id !== itemId);
                showToast("Error saving featured item: " + (err.message || 'Unknown error'));
                // Reload from API
                await loadFromStorage();
                renderAdminFeatured();
                renderFeaturedMedia();
            }
        };

        reader.readAsDataURL(fileInput.files[0]);
    } catch (err) {
        console.error('Error processing file:', err);
        showToast("Error processing file");
    }
}

async function deleteFeatured(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can remove featured media");
    }
    
    if (!confirm("Remove from featured?")) return;
    
    try {
        featuredMedia = featuredMedia.filter(f => f.id !== id);
        await api.deleteFeaturedMedia(id);
        renderAdminFeatured();
        renderFeaturedMedia();
        showToast("Removed from featured");
    } catch (err) {
        console.error('Error deleting featured item:', err);
        showToast("Error deleting featured item");
        // Reload from API
        await loadFromStorage();
        renderAdminFeatured();
        renderFeaturedMedia();
    }
}

// ========== MEDIA DETAIL ==========
function openMediaDetail(id, type) {
    let item;
    if (type === 'featured') {
        item = featuredMedia.find(f => f.id === id);
    } else {
        item = files.find(f => f.id === id);
    }

    if (!item) return;

    const isLiked = likedItems[id] || false;
    const likeIcon = isLiked ? 'fas fa-heart' : 'far fa-heart';
    const likeClass = isLiked ? 'liked' : '';

    document.getElementById('mediaDetailTitle').textContent = item.title || item.name;
    
    const content = document.getElementById('mediaDetailContent');
    content.innerHTML = `
        <div class="media-detail-view">
            <img src="${item.url}" style="max-width:100%; border-radius:12px; margin-bottom:20px;">
            ${item.description ? `<p style="margin-bottom:15px;">${item.description}</p>` : ''}
            ${item.tags ? `<div class="file-tags">${item.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
            <div class="media-interactions" style="justify-content:center; margin-top:20px;">
                <button class="interaction-btn ${likeClass}" onclick="likeMedia('${id}', '${type}')">
                    <i class="${likeIcon}"></i> <span id="detail-like-count-${id}">${item.likes || 0}</span> Likes
                </button>
                <a href="${item.url}" download class="interaction-btn">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        </div>
    `;

    document.getElementById('mediaDetailModal').classList.remove('hidden');
}

function closeMediaDetail() {
    document.getElementById('mediaDetailModal').classList.add('hidden');
}

async function likeMedia(id, type = 'file') {
    // Check if already liked
    if (likedItems[id]) {
        showToast("You've already liked this!");
        return;
    }

    let item;
    if (type === 'featured') {
        item = featuredMedia.find(f => f.id === id);
    } else {
        item = files.find(f => f.id === id);
    }

    if (!item) return;

    // Increment likes
    item.likes = (item.likes || 0) + 1;
    
    // Mark as liked by this user
    likedItems[id] = true;
    localStorage.setItem('likedItems', JSON.stringify(likedItems));

    // Save to storage
    await saveToStorage(id, item);
    
    // Update UI
    const likeCountElements = [
        document.getElementById(`like-count-${id}`),
        document.getElementById(`detail-like-count-${id}`)
    ];
    
    likeCountElements.forEach(el => {
        if (el) el.textContent = item.likes;
    });
    
    // Update heart icon
    const heartButtons = document.querySelectorAll(`[onclick*="likeMedia('${id}'"]`);
    heartButtons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-heart';
            btn.classList.add('liked');
        }
    });
    
    renderFeaturedMedia();
    renderPublicContent();
    updateLikesStats(); // Update admin stats
    showToast("Liked! ❤️");
}

// ========== SLIDER ==========
function startHeroSlider() {
    const container = document.getElementById('publicHeroSlider');
    let idx = 0;

    function cycle() {
        if (sliderImages.length === 0) return;
        idx = (idx + 1) % sliderImages.length;
        
        if (sliderAnimation === 'fade') {
            container.style.opacity = 0;
            setTimeout(() => {
                container.style.backgroundImage = `url('${sliderImages[idx].url}')`;
                container.style.opacity = 1;
            }, 500);
        } else if (sliderAnimation === 'slide') {
            container.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                container.style.backgroundImage = `url('${sliderImages[idx].url}')`;
                container.style.transform = 'translateX(0)';
            }, 500);
        } else if (sliderAnimation === 'zoom') {
            container.style.transform = 'scale(1.2)';
            container.style.opacity = 0;
            setTimeout(() => {
                container.style.backgroundImage = `url('${sliderImages[idx].url}')`;
                container.style.transform = 'scale(1)';
                container.style.opacity = 1;
            }, 500);
        }
    }

    if (sliderImages.length > 0) container.style.backgroundImage = `url('${sliderImages[0].url}')`;
    setInterval(cycle, 5000);
}

function renderAdminSlider() {
    const list = document.getElementById('adminSliderList');
    const select = document.getElementById('sliderAnimSelect');
    select.value = sliderAnimation;
    
    list.innerHTML = '';
    sliderImages.forEach(img => {
        list.innerHTML += `
            <div class="file-card">
                <img src="${img.url}" class="file-preview">
                <div class="file-info">
                    <button onclick="removeSlider(${img.id})" class="btn btn-danger" style="width:100%">Remove</button>
                </div>
            </div>`;
    });
}

async function addSliderImage() {
    const input = document.getElementById('sliderFileInput');
    if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            sliderImages.push({ id: Date.now(), url: e.target.result });
            await saveToStorage('slider_images', sliderImages);
            renderAdminSlider();
            showToast("Slide Added");
            input.value = '';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function removeSlider(id) {
    sliderImages = sliderImages.filter(s => s.id !== id);
    await saveToStorage('slider_images', sliderImages);
    renderAdminSlider();
    showToast("Slide Removed");
}

async function updateSliderAnimation() {
    sliderAnimation = document.getElementById('sliderAnimSelect').value;
    await saveToStorage('slider_animation', sliderAnimation);
    showToast(`Animation: ${sliderAnimation}`);
}

// ========== ANNOUNCEMENTS ==========
function renderPublicHome() {
    const annCont = document.getElementById('publicAnnouncementContainer');
    annCont.innerHTML = '';
    
    announcements.forEach(a => {
        const imageHTML = a.image ? `<img src="${a.image}" style="width:100%; border-radius:8px; margin-bottom:15px;">` : '';
        annCont.innerHTML += `
            <div class="update-card ${a.highlight ? 'highlight' : ''}">
                <span class="date-badge">${a.date}</span>
                ${imageHTML}
                <h3>${a.title}</h3>
                <p>${a.content}</p>
            </div>`;
    });

    renderFeaturedMedia();
    resetPublicView();
}

function renderAdminAnnouncements() {
    const list = document.getElementById('adminAnnouncementList');
    list.innerHTML = '';
    
    announcements.forEach(a => {
        const imagePreview = a.image ? `<img src="${a.image}" style="width:80px; height:60px; object-fit:cover; border-radius:6px; margin-right:15px;">` : '';
        list.innerHTML += `
            <div class="update-card" style="display:flex; align-items:center;">
                ${imagePreview}
                <div style="flex:1;">
                    <div class="item-title">${a.title}</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">${a.content}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="removeAnn(${a.id})">Delete</button>
            </div>`;
    });
}

async function addAnnouncement() {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can add announcements");
    }
    
    const d = document.getElementById('annDate')?.value.trim();
    const t = document.getElementById('annTitle')?.value.trim();
    const c = document.getElementById('annContent')?.value.trim();
    const h = document.getElementById('annHighlight')?.checked || false;
    const imageInput = document.getElementById('annImageUpload');

    if (!d || !t) {
        return showToast("Please fill date and title");
    }

    const processAnnouncement = async (imageData = null) => {
        announcements.push({ 
            id: Date.now(), 
            date: d, 
            title: t, 
            content: c, 
            highlight: h,
            image: imageData
        });
        await saveToStorage('announcements', announcements);
        renderAdminAnnouncements();
        renderPublicHome();
        showToast("Published");
        if (document.getElementById('annDate')) document.getElementById('annDate').value = '';
        if (document.getElementById('annTitle')) document.getElementById('annTitle').value = '';
        if (document.getElementById('annContent')) document.getElementById('annContent').value = '';
        if (document.getElementById('annHighlight')) document.getElementById('annHighlight').checked = false;
        if (document.getElementById('annImageUpload')) document.getElementById('annImageUpload').value = '';
    };

    if (imageInput && imageInput.files && imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            await processAnnouncement(e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        await processAnnouncement();
    }
}

async function removeAnn(id) {
    if (currentUser.level < 2) {
        return showToast("Only Level 2+ can delete announcements");
    }
    
    if (confirm("Delete this announcement?")) {
        try {
            await api.deleteAnnouncement(id);
            announcements = announcements.filter(a => a.id !== id);
            renderAdminAnnouncements();
            renderPublicHome();
            showToast("Announcement Deleted");
        } catch (err) {
            showToast("Error deleting announcement");
        }
    }
}

// ========== STAFF MANAGEMENT ==========
function loadStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    const baseHTML = `
        <tr>
            <td>Senior Pastor</td>
            <td>pastor@lfcgl.com</td>
            <td><span class="badge badge-level3">Level 3</span></td>
            <td><span class="badge badge-active">Active</span></td>
            <td><span class="badge badge-gray">Protected</span></td>
        </tr>`;

    let staffHTML = '';
    staffMembers.forEach(staff => {
        staffHTML += `
            <tr>
                <td>${staff.name}</td>
                <td>${staff.email}</td>
                <td><span class="badge badge-level${staff.level}">Level ${staff.level}</span></td>
                <td><span class="badge badge-active">Active</span></td>
                <td>
                    ${currentUser.level === 3 ? `<button class="btn btn-danger btn-sm" onclick="removeStaff('${staff.id}')">Remove</button>` : '<span class="badge badge-gray">No Access</span>'}
                </td>
            </tr>`;
    });

    tbody.innerHTML = baseHTML + staffHTML;
}

async function addStaff() {
    if (currentUser.level !== 3) {
        return showToast("Only Level 3 admins can add staff");
    }

    const name = document.getElementById('newStaffName').value.trim();
    const email = document.getElementById('newStaffEmail').value.trim();
    const password = document.getElementById('newStaffPassword').value.trim();
    const level = parseInt(document.getElementById('newStaffLevel').value);

    if (!name || !email || !password) {
        return showToast("Please fill all fields");
    }

    const newStaff = {
        id: 'staff_' + Date.now(),
        name,
        email,
        password,
        level,
        addedDate: new Date().toISOString()
    };

    staffMembers.push(newStaff);
    await saveToStorage('staff_members', staffMembers);
    loadStaffTable();
    showToast("Staff member added");

    document.getElementById('newStaffName').value = '';
    document.getElementById('newStaffEmail').value = '';
    document.getElementById('newStaffPassword').value = '';
    document.getElementById('newStaffLevel').value = '1';
}

async function removeStaff(id) {
    if (currentUser.level !== 3) {
        return showToast("Only Level 3 admins can remove staff");
    }

    if (!confirm("Remove this staff member?")) return;

    staffMembers = staffMembers.filter(s => s.id !== id);
    await saveToStorage('staff_members', staffMembers);
    loadStaffTable();
    showToast("Staff member removed");
}

// ========== CHART ==========
let currentAudio = null;
let currentPlayingId = null;

function playAudioPreview(id, url) {
    const audio = document.getElementById(`audio-${id}`);
    const playBtn = document.getElementById(`play-btn-${id}`);
    
    // Stop any currently playing audio
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentPlayingId) {
            const prevBtn = document.getElementById(`play-btn-${currentPlayingId}`);
            if (prevBtn) prevBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        currentAudio = audio;
        currentPlayingId = id;
        
        // Play 30 second preview only
        setTimeout(() => {
            if (!audio.paused && audio.currentTime < 30) {
                audio.pause();
                audio.currentTime = 0;
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                showToast("Preview ended. Download for full audio.");
            }
        }, 30000);
        
        audio.onended = () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        };
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function openVideoPlayer(id, url, name) {
    const modal = document.getElementById('mediaDetailModal');
    document.getElementById('mediaDetailTitle').textContent = name;
    
    const content = document.getElementById('mediaDetailContent');
    content.innerHTML = `
        <div class="media-detail-view">
            <video controls autoplay style="width:100%; max-height:500px; border-radius:12px;" src="${url}"></video>
            <div class="media-interactions" style="justify-content:center; margin-top:20px;">
                <button class="interaction-btn ${likedItems[id] ? 'liked' : ''}" onclick="likeMedia('${id}', 'file')">
                    <i class="${likedItems[id] ? 'fas' : 'far'} fa-heart"></i> 
                    <span id="detail-like-count-${id}">${files.find(f => f.id === id)?.likes || 0}</span> Likes
                </button>
                <a href="${url}" download class="interaction-btn">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function openPDFViewer(id, url, name) {
    const modal = document.getElementById('mediaDetailModal');
    document.getElementById('mediaDetailTitle').textContent = name;
    
    const content = document.getElementById('mediaDetailContent');
    content.innerHTML = `
        <div class="media-detail-view">
            <iframe src="${url}" style="width:100%; height:600px; border:none; border-radius:12px;"></iframe>
            <div class="media-interactions" style="justify-content:center; margin-top:20px;">
                <button class="interaction-btn ${likedItems[id] ? 'liked' : ''}" onclick="likeMedia('${id}', 'file')">
                    <i class="${likedItems[id] ? 'fas' : 'far'} fa-heart"></i> 
                    <span id="detail-like-count-${id}">${files.find(f => f.id === id)?.likes || 0}</span> Likes
                </button>
                <a href="${url}" download class="interaction-btn">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function updateLikesStats() {
    // Calculate total likes
    const totalLikes = [...files, ...featuredMedia].reduce((sum, item) => sum + (item.likes || 0), 0);
    
    const totalLikesEl = document.getElementById('totalLikesCount');
    if (totalLikesEl) {
        totalLikesEl.textContent = totalLikes;
    }
    
    // Get top liked items
    const allItems = [...files, ...featuredMedia].map(item => ({
        name: item.title || item.name,
        likes: item.likes || 0,
        type: item.title ? 'Featured' : 'File'
    })).sort((a, b) => b.likes - a.likes).slice(0, 5);
    
    const topLikedContainer = document.getElementById('topLikedContent');
    if (topLikedContainer) {
        if (allItems.length === 0 || allItems[0].likes === 0) {
            topLikedContainer.innerHTML = '<p class="text-muted">No likes yet</p>';
        } else {
            topLikedContainer.innerHTML = allItems.map((item, index) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-body); border-radius:8px; margin-bottom:10px;">
                    <div>
                        <strong>${index + 1}. ${item.name}</strong>
                        <span style="color:var(--text-muted); margin-left:10px; font-size:0.9rem;">${item.type}</span>
                    </div>
                    <div style="color:#ef4444; font-weight:600;">
                        <i class="fas fa-heart"></i> ${item.likes}
                    </div>
                </div>
            `).join('');
        }
    }
}

function initChart() {
    const chartElement = document.getElementById('trafficChart');
    if (!chartElement) {
        console.log('Chart element not found (not on admin page)');
        return;
    }
    
    const ctx = chartElement.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Visitors',
                data: [120, 190, 300, 500, 200, 300, 450],
                borderColor: '#6366f1',
                tension: 0.4
            }, {
                label: 'Downloads',
                data: [50, 100, 150, 200, 80, 120, 200],
                borderColor: '#ec4899',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}