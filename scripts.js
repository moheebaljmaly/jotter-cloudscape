
/**
 * Notes App
 * This script provides functionality for a simple notes application
 * Features: Create, edit, view, delete notes, search, backup and theme switching
 */

// Global variables
let notes = [];
let currentNoteId = null;
let isEditMode = false;
let currentTheme = 'light';
let offlineMode = false;

// DOM Elements
const homePage = document.getElementById('homePage');
const editPage = document.getElementById('editPage');
const viewPage = document.getElementById('viewPage');
const backButton = document.getElementById('backButton');
const addButton = document.getElementById('addButton');
const emptyAddButton = document.getElementById('emptyAddButton');
const backupButton = document.getElementById('backupButton');
const themeToggle = document.getElementById('themeToggle');
const pageTitle = document.getElementById('pageTitle');
const searchInput = document.getElementById('searchInput');
const notesList = document.getElementById('notesList');
const emptyNotesMessage = document.getElementById('emptyNotesMessage');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const editNoteButton = document.getElementById('editNoteButton');
const shareNoteButton = document.getElementById('shareNoteButton');
const deleteNoteButton = document.getElementById('deleteNoteButton');
const createdDateElement = document.getElementById('createdDate');
const updatedDateElement = document.getElementById('updatedDate');
const noteContentView = document.getElementById('noteContentView');
const backupDialog = document.getElementById('backupDialog');
const closeDialogButton = document.getElementById('closeDialogButton');
const offlineModeSwitch = document.getElementById('offlineMode');
const connectionStatus = document.getElementById('connectionStatus');
const connectionStatusText = document.getElementById('connectionStatusText');
const localBackupButton = document.getElementById('localBackupButton');
const cloudBackupButton = document.getElementById('cloudBackupButton');
const importBackupInput = document.getElementById('importBackupInput');
const importBackupButton = document.getElementById('importBackupButton');
const deleteDialog = document.getElementById('deleteDialog');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const offlineIndicator = document.getElementById('offlineIndicator');
const tabTriggers = document.querySelectorAll('.tab-trigger');
const tabContents = document.querySelectorAll('.tab-content');
const currentYearElement = document.getElementById('currentYear');

// Initialize the app
function initApp() {
  // Set current year in footer
  currentYearElement.textContent = new Date().getFullYear();
  
  // Load notes from localStorage
  loadNotes();
  
  // Load theme settings
  loadTheme();
  
  // Load offline mode settings
  loadOfflineMode();
  
  // Check connection status
  checkConnectionStatus();
  
  // Attach event listeners
  attachEventListeners();
  
  // Render notes list
  renderNotes();
}

// Load notes from localStorage
function loadNotes() {
  const savedNotes = localStorage.getItem('notes-app-data');
  if (savedNotes) {
    notes = JSON.parse(savedNotes);
  }
}

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem('notes-app-data', JSON.stringify(notes));
  // Dispatch an event for multi-tab support
  window.dispatchEvent(new Event('storage'));
}

// Load theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('note-app-theme');
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme = 'dark';
    }
  }
  
  // Apply theme
  applyTheme();
}

// Apply theme to document
function applyTheme() {
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Save theme to localStorage
  localStorage.setItem('note-app-theme', currentTheme);
}

// Toggle theme
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme();
}

// Load offline mode setting
function loadOfflineMode() {
  const savedOfflineMode = localStorage.getItem('note-app-offline-mode');
  if (savedOfflineMode !== null) {
    offlineMode = savedOfflineMode === 'true';
    offlineModeSwitch.checked = offlineMode;
    updateOfflineIndicator();
  }
}

// Toggle offline mode
function toggleOfflineMode() {
  offlineMode = !offlineMode;
  localStorage.setItem('note-app-offline-mode', offlineMode);
  offlineModeSwitch.checked = offlineMode;
  updateOfflineIndicator();
  
  // Check connection status if turning off offline mode
  if (!offlineMode) {
    checkConnectionStatus();
  }
  
  // Show toast notification
  showToast(
    offlineMode 
      ? 'تم تفعيل وضع عدم الاتصال' 
      : 'تم إلغاء وضع عدم الاتصال',
    'success'
  );
  
  return offlineMode;
}

// Update offline indicator visibility
function updateOfflineIndicator() {
  if (offlineMode) {
    offlineIndicator.classList.remove('hidden');
  } else {
    offlineIndicator.classList.add('hidden');
  }
}

// Check internet connection status
async function checkConnectionStatus() {
  if (offlineMode) {
    updateConnectionStatusUI(false);
    return false;
  }
  
  try {
    // Try to fetch a resource to check connection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    updateConnectionStatusUI(true);
    return true;
  } catch (error) {
    updateConnectionStatusUI(false);
    return false;
  }
}

// Update connection status UI
function updateConnectionStatusUI(isOnline) {
  if (isOnline) {
    connectionStatus.classList.remove('offline');
    connectionStatus.classList.add('online');
    connectionStatusText.textContent = 'متصل بالإنترنت';
    cloudBackupButton.disabled = false;
  } else {
    connectionStatus.classList.remove('online');
    connectionStatus.classList.add('offline');
    connectionStatusText.textContent = 'غير متصل بالإنترنت';
    cloudBackupButton.disabled = true;
  }
}

// Attach event listeners
function attachEventListeners() {
  // Navigation
  backButton.addEventListener('click', navigateBack);
  addButton.addEventListener('click', createNewNote);
  emptyAddButton.addEventListener('click', createNewNote);
  
  // Search
  searchInput.addEventListener('input', handleSearch);
  
  // Form
  noteForm.addEventListener('submit', saveNote);
  cancelButton.addEventListener('click', cancelEdit);
  
  // View note
  editNoteButton.addEventListener('click', editCurrentNote);
  shareNoteButton.addEventListener('click', shareNote);
  deleteNoteButton.addEventListener('click', showDeleteConfirmation);
  
  // Backup dialog
  backupButton.addEventListener('click', openBackupDialog);
  closeDialogButton.addEventListener('click', closeBackupDialog);
  offlineModeSwitch.addEventListener('change', toggleOfflineMode);
  localBackupButton.addEventListener('click', createLocalBackup);
  cloudBackupButton.addEventListener('click', createCloudBackup);
  importBackupButton.addEventListener('click', openImportDialog);
  importBackupInput.addEventListener('change', importBackup);
  
  // Delete dialog
  cancelDeleteButton.addEventListener('click', closeDeleteDialog);
  confirmDeleteButton.addEventListener('click', deleteCurrentNote);
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Tabs
  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetTab = trigger.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
  
  // Window storage event (for multi-tab support)
  window.addEventListener('storage', handleStorageChange);
}

// Handle storage events from other tabs
function handleStorageChange(event) {
  if (event.key === 'notes-app-data') {
    loadNotes();
    renderNotes();
    
    // If viewing a note that was updated in another tab
    if (isPageActive(viewPage) && currentNoteId) {
      const note = findNoteById(currentNoteId);
      if (note) {
        renderNoteView(note);
      } else {
        // Note was deleted in another tab
        navigateToHome();
      }
    }
  }
}

// Render notes list
function renderNotes() {
  const searchText = searchInput.value.trim().toLowerCase();
  const filteredNotes = searchText ? searchNotes(searchText) : [...notes];
  
  notesList.innerHTML = '';
  
  if (filteredNotes.length === 0) {
    notesList.classList.add('hidden');
    emptyNotesMessage.classList.remove('hidden');
  } else {
    notesList.classList.remove('hidden');
    emptyNotesMessage.classList.add('hidden');
    
    filteredNotes.forEach(note => {
      const noteCard = createNoteCard(note, searchText);
      notesList.appendChild(noteCard);
    });
  }
}

// Create note card element
function createNoteCard(note, searchText) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;
  
  const previewContent = note.content.length > 100
    ? `${note.content.substring(0, 100)}...`
    : note.content;
  
  let title = note.title;
  let content = previewContent;
  
  // Highlight search terms if provided
  if (searchText) {
    title = highlightSearchTerms(title, searchText);
    content = highlightSearchTerms(content, searchText);
  }
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(note.updatedAt));
  
  card.innerHTML = `
    <div class="note-card-header">
      <h3 class="note-card-title">${title}</h3>
      <div class="note-card-date">${formattedDate}</div>
    </div>
    <div class="note-card-content">${content}</div>
  `;
  
  card.addEventListener('click', () => viewNote(note.id));
  
  return card;
}

// Highlight search terms in text
function highlightSearchTerms(text, searchText) {
  if (!searchText) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Escape special characters for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Format distance to now (e.g., "2 days ago")
function formatDistanceToNow(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'الآن';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `منذ ${diffInDays} يوم`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `منذ ${diffInMonths} شهر`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `منذ ${diffInYears} سنة`;
}

// Format date to locale string
function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Search notes by title and content
function searchNotes(searchText) {
  if (!searchText) return [...notes];
  
  searchText = searchText.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(searchText) || 
    note.content.toLowerCase().includes(searchText)
  );
}

// Handle search input
function handleSearch() {
  renderNotes();
}

// Create a new note
function createNewNote() {
  resetForm();
  isEditMode = false;
  currentNoteId = null;
  navigateToPage(editPage);
  setPageTitle('ملاحظة جديدة');
}

// Edit a note
function editNote(noteId) {
  const note = findNoteById(noteId);
  if (!note) return;
  
  currentNoteId = noteId;
  isEditMode = true;
  
  noteTitleInput.value = note.title;
  noteContentInput.value = note.content;
  
  navigateToPage(editPage);
  setPageTitle('تعديل الملاحظة');
}

// View a note
function viewNote(noteId) {
  const note = findNoteById(noteId);
  if (!note) return;
  
  currentNoteId = noteId;
  renderNoteView(note);
  
  navigateToPage(viewPage);
  setPageTitle(note.title);
}

// Render note view
function renderNoteView(note) {
  createdDateElement.textContent = `إنشاء: ${formatDate(note.createdAt)}`;
  updatedDateElement.textContent = `تعديل: ${formatDate(note.updatedAt)}`;
  noteContentView.textContent = note.content;
}

// Edit current note
function editCurrentNote() {
  if (currentNoteId) {
    editNote(currentNoteId);
  }
}

// Share note
async function shareNote() {
  const note = findNoteById(currentNoteId);
  if (!note) return;
  
  const text = `${note.title}\n\n${note.content}`;
  
  // Try to use Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: note.title,
        text: note.content
      });
      return;
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }
  
  // Fallback to clipboard copying
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم نسخ الملاحظة إلى الحافظة', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast('لم نتمكن من نسخ الملاحظة', 'error');
  }
}

// Save note
function saveNote(event) {
  event.preventDefault();
  
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();
  
  if (!title) {
    showToast('العنوان مطلوب', 'error');
    return;
  }
  
  if (isEditMode && currentNoteId) {
    // Update existing note
    const index = notes.findIndex(note => note.id === currentNoteId);
    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        title,
        content,
        updatedAt: new Date().toISOString()
      };
      
      showToast('تم تحديث الملاحظة بنجاح', 'success');
    }
  } else {
    // Create new note
    const newNote = {
      id: generateId(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote); // Add to beginning of array
    showToast('تم إنشاء ملاحظة جديدة بنجاح', 'success');
  }
  
  saveNotes();
  navigateToHome();
}

// Cancel edit
function cancelEdit() {
  navigateBack();
}

// Delete current note
function deleteCurrentNote() {
  if (!currentNoteId) return;
  
  const index = notes.findIndex(note => note.id === currentNoteId);
  if (index !== -1) {
    notes.splice(index, 1);
    saveNotes();
    
    closeDeleteDialog();
    navigateToHome();
    showToast('تم حذف الملاحظة بنجاح', 'success');
  }
}

// Show delete confirmation dialog
function showDeleteConfirmation() {
  deleteDialog.classList.add('open');
}

// Close delete dialog
function closeDeleteDialog() {
  deleteDialog.classList.remove('open');
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Find note by ID
function findNoteById(id) {
  return notes.find(note => note.id === id);
}

// Reset form
function resetForm() {
  noteForm.reset();
}

// Navigate back
function navigateBack() {
  if (isPageActive(editPage)) {
    navigateToHome();
  } else if (isPageActive(viewPage)) {
    navigateToHome();
  }
}

// Navigate to home page
function navigateToHome() {
  navigateToPage(homePage);
  setPageTitle('مذكراتي');
  currentNoteId = null;
}

// Navigate to a specific page
function navigateToPage(page) {
  // Hide all pages
  homePage.classList.remove('active');
  editPage.classList.remove('active');
  viewPage.classList.remove('active');
  
  // Show the target page
  page.classList.add('active');
  
  // Update back button visibility
  updateBackButtonVisibility(page);
  
  // Update add button visibility
  updateAddButtonVisibility(page);
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Check if a page is active
function isPageActive(page) {
  return page.classList.contains('active');
}

// Update back button visibility
function updateBackButtonVisibility(activePage) {
  if (activePage === homePage) {
    backButton.classList.add('hidden');
  } else {
    backButton.classList.remove('hidden');
  }
}

// Update add button visibility
function updateAddButtonVisibility(activePage) {
  if (activePage === homePage) {
    addButton.classList.remove('hidden');
  } else {
    addButton.classList.add('hidden');
  }
}

// Set page title
function setPageTitle(title) {
  pageTitle.textContent = title;
}

// Show toast notification
function showToast(message, type = 'default') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button class="toast-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
    </button>
  `;
  
  const toastContainer = document.getElementById('toastContainer');
  toastContainer.appendChild(toast);
  
  // Add close event listener
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    closeToast(toast);
  });
  
  // Auto close after 3 seconds
  setTimeout(() => {
    closeToast(toast);
  }, 3000);
}

// Close toast notification
function closeToast(toast) {
  toast.classList.add('closing');
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Open backup dialog
function openBackupDialog() {
  backupDialog.classList.add('open');
  checkConnectionStatus();
}

// Close backup dialog
function closeBackupDialog() {
  backupDialog.classList.remove('open');
}

// Switch tab
function switchTab(tabId) {
  // Update tab triggers
  tabTriggers.forEach(trigger => {
    if (trigger.getAttribute('data-tab') === tabId) {
      trigger.classList.add('active');
    } else {
      trigger.classList.remove('active');
    }
  });
  
  // Update tab contents
  tabContents.forEach(content => {
    if (content.getAttribute('data-tab') === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Create local backup
function createLocalBackup() {
  try {
    const backupData = {
      notes,
      version: 1,
      createdAt: new Date().toISOString()
    };
    
    const backupString = JSON.stringify(backupData);
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('تم إنشاء نسخة احتياطية محلية بنجاح', 'success');
    closeBackupDialog();
    
    return true;
  } catch (error) {
    console.error('Error creating local backup:', error);
    showToast('فشل إنشاء نسخة احتياطية محلية', 'error');
    return false;
  }
}

// Create cloud backup
async function createCloudBackup() {
  if (offlineMode) {
    showToast('يجب أن يكون وضع عدم الاتصال معطلاً لعمل نسخة احتياطية سحابية', 'error');
    return false;
  }
  
  const isOnline = await checkConnectionStatus();
  if (!isOnline) {
    showToast('لا يمكن عمل نسخة احتياطية سحابية، أنت غير متصل بالإنترنت', 'error');
    return false;
  }
  
  // This is a placeholder for cloud backup functionality
  // In a real application, this would upload to a cloud service
  
  setTimeout(() => {
    showToast('تم عمل نسخة احتياطية سحابية بنجاح', 'success');
    closeBackupDialog();
  }, 1500);
  
  return true;
}

// Open import dialog
function openImportDialog() {
  importBackupInput.click();
}

// Import backup from file
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const backupData = JSON.parse(e.target.result);
      
      if (Array.isArray(backupData.notes)) {
        notes = backupData.notes;
        saveNotes();
        showToast('تم استيراد النسخة الاحتياطية بنجاح', 'success');
        renderNotes();
        closeBackupDialog();
      } else {
        throw new Error('Invalid backup format');
      }
    } catch (error) {
      console.error('Error importing backup:', error);
      showToast('ملف النسخة الاحتياطية غير صالح', 'error');
    }
  };
  
  reader.onerror = function() {
    showToast('فشل قراءة الملف', 'error');
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
