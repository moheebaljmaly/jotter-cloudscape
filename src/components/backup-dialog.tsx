
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, UploadCloud, Wifi, WifiOff } from "lucide-react";
import { checkOnlineStatus, createBackup, importBackup } from "@/lib/backup-service";
import { toast } from "sonner";

export function BackupDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // التحقق من حالة الاتصال عند فتح الحوار
  React.useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
    }
  }, [isOpen]);

  // دالة التحقق من حالة الاتصال
  const checkConnectionStatus = async () => {
    const online = await checkOnlineStatus();
    setIsOnline(online);
  };

  // دالة إنشاء نسخة احتياطية
  const handleCreateBackup = async () => {
    const online = await checkOnlineStatus();
    
    if (!online) {
      toast('لا يوجد اتصال بالإنترنت', {
        description: 'يرجى الاتصال بالإنترنت أولاً لعمل نسخة احتياطية',
      });
      return;
    }
    
    createBackup();
    setIsOpen(false);
  };

  // دالة فتح نافذة اختيار الملفات
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // دالة استيراد النسخة الاحتياطية
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await importBackup(file);
      if (success) {
        setIsOpen(false);
        // إعادة تحميل الصفحة لتحديث الملاحظات
        window.location.reload();
      }
    } catch (error) {
      console.error('فشل استيراد النسخة الاحتياطية:', error);
    } finally {
      // إعادة تعيين حقل الملف
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={checkConnectionStatus}>
          <Database className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>النسخ الاحتياطي للملاحظات</DialogTitle>
          <DialogDescription>
            قم بعمل نسخة احتياطية من ملاحظاتك أو استعادتها من نسخة سابقة
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          {/* عرض حالة الاتصال */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-muted">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-green-500">متصل بالإنترنت</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-destructive" />
                <span className="text-destructive">غير متصل بالإنترنت</span>
              </>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleCreateBackup} 
              className="w-full"
              disabled={!isOnline}
            >
              <UploadCloud className="ml-2 h-4 w-4" />
              إنشاء نسخة احتياطية
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />
            
            <Button 
              variant="outline" 
              onClick={handleImportClick} 
              className="w-full"
            >
              <Database className="ml-2 h-4 w-4" />
              استيراد نسخة احتياطية
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
