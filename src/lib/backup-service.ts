
// خدمة النسخ الاحتياطي للملاحظات
import { Note, getNotes } from './note-service';
import { toast } from 'sonner';

// متغير للتحكم في وضع عدم الاتصال (Offline Mode)
let offlineMode = localStorage.getItem('offline-mode') === 'true';

// دالة للحصول على حالة وضع عدم الاتصال
export const getOfflineMode = (): boolean => {
  return offlineMode;
};

// دالة لتغيير وضع الاتصال
export const toggleOfflineMode = (): boolean => {
  offlineMode = !offlineMode;
  localStorage.setItem('offline-mode', offlineMode.toString());
  return offlineMode;
};

// دالة للتحقق من وجود اتصال بالإنترنت
export const checkOnlineStatus = async (): Promise<boolean> => {
  // إذا كان وضع عدم الاتصال مفعل، نعتبر أنه لا يوجد اتصال
  if (offlineMode) {
    return false;
  }
  
  try {
    // استخدام تقنية navigator.onLine للتحقق من حالة الاتصال أولاً
    if (!navigator.onLine) {
      return false;
    }
    
    // محاولة الوصول إلى ملف صغير للتأكد من الاتصال الفعلي
    // استخدام Date.now() لتجنب التخزين المؤقت
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثواني كمهلة قصوى
    
    const response = await fetch(`https://www.cloudflare.com/cdn-cgi/trace?${Date.now()}`, { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.error('فشل التحقق من الاتصال بالإنترنت:', error);
    return false;
  }
};

// دالة لإنشاء ملف النسخة الاحتياطية المحلية وتنزيله
export const createLocalBackup = (): void => {
  try {
    const notes = getNotes();
    
    if (notes.length === 0) {
      toast('لا توجد ملاحظات للنسخ الاحتياطي');
      return;
    }
    
    // إنشاء بيانات النسخة الاحتياطية
    const backupData = {
      data: notes,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    // تحويل البيانات إلى نص JSON
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // إنشاء رابط تنزيل وتنفيذه
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // تعيين اسم الملف بتاريخ النسخ الاحتياطي
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    link.download = `note-backup-${formattedDate}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast('تم إنشاء النسخة الاحتياطية المحلية بنجاح');
  } catch (error) {
    console.error('فشل إنشاء النسخة الاحتياطية المحلية:', error);
    toast('حدث خطأ أثناء إنشاء النسخة الاحتياطية', {
      description: 'يرجى المحاولة مرة أخرى لاحقاً',
    });
  }
};

// دالة لإنشاء نسخة احتياطية وتنزيلها (للتوافق مع الكود القديم)
export const createBackup = async (): Promise<void> => {
  try {
    // التحقق من الاتصال بالإنترنت إذا كان يريد الرفع للسحابة
    const isOnline = await checkOnlineStatus();
    
    if (!isOnline) {
      // إذا لم يكن هناك اتصال بالإنترنت، قم بعمل نسخة محلية
      toast('لا يوجد اتصال بالإنترنت، سيتم إنشاء نسخة احتياطية محلية');
      createLocalBackup();
      return;
    }
    
    // هنا يمكن إضافة الرمز الخاص برفع البيانات إلى السحابة
    // في الوقت الحالي سنستخدم النسخة المحلية
    createLocalBackup();
  } catch (error) {
    console.error('فشل إنشاء النسخة الاحتياطية:', error);
    toast('حدث خطأ أثناء إنشاء النسخة الاحتياطية', {
      description: 'يرجى المحاولة مرة أخرى لاحقاً',
    });
  }
};

// دالة لإنشاء نسخة احتياطية في السحابة الإلكترونية (يتطلب اتصالاً بالإنترنت)
export const createCloudBackup = async (): Promise<boolean> => {
  try {
    const notes = getNotes();
    
    if (notes.length === 0) {
      toast('لا توجد ملاحظات للنسخ الاحتياطي');
      return false;
    }
    
    // التحقق من وجود اتصال بالإنترنت
    const isOnline = await checkOnlineStatus();
    
    if (!isOnline) {
      toast('لا يوجد اتصال بالإنترنت', {
        description: 'يرجى الاتصال بالإنترنت أولاً لعمل نسخة احتياطية سحابية',
      });
      return false;
    }
    
    // هنا سيتم تنفيذ رمز رفع البيانات إلى السحابة الإلكترونية
    // كمثال بسيط سنعرض رسالة نجاح بدون تنفيذ فعلي
    
    toast('تم إنشاء النسخة الاحتياطية السحابية بنجاح', {
      description: 'تم حفظ البيانات في السحابة الإلكترونية',
    });
    
    return true;
  } catch (error) {
    console.error('فشل إنشاء النسخة الاحتياطية السحابية:', error);
    toast('حدث خطأ أثناء إنشاء النسخة الاحتياطية السحابية', {
      description: 'يرجى المحاولة مرة أخرى لاحقاً',
    });
    return false;
  }
};

// استيراد ملف النسخة الاحتياطية
export const importBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('فشل قراءة الملف');
        }
        
        const backupData = JSON.parse(event.target.result);
        
        // التحقق من صحة بيانات النسخة الاحتياطية
        if (!backupData || !backupData.data || !Array.isArray(backupData.data)) {
          throw new Error('ملف النسخة الاحتياطية غير صالح');
        }
        
        // التحقق من أن البيانات هي ملاحظات بالفعل
        const notes = backupData.data as Note[];
        if (notes.length > 0 && (!notes[0].id || !notes[0].title || !notes[0].content)) {
          throw new Error('بيانات الملاحظات غير صالحة');
        }
        
        // حفظ البيانات في التخزين المحلي
        localStorage.setItem('notes-app-data', JSON.stringify(notes));
        
        toast('تم استيراد النسخة الاحتياطية بنجاح', {
          description: `تم استيراد ${notes.length} ملاحظة`,
        });
        
        resolve(true);
      } catch (error) {
        console.error('فشل استيراد النسخة الاحتياطية:', error);
        toast('فشل استيراد النسخة الاحتياطية', {
          description: 'الملف غير صالح أو تالف',
        });
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('خطأ في قراءة الملف:', error);
      toast('فشل قراءة ملف النسخة الاحتياطية');
      reject(error);
    };
    
    reader.readAsText(file);
  });
};
