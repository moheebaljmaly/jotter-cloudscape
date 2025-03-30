
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Download, UploadCloud, Wifi, WifiOff } from "lucide-react";
import { checkOnlineStatus, createLocalBackup, createCloudBackup, importBackup, getOfflineMode, toggleOfflineMode } from "@/lib/backup-service";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BackupDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(getOfflineMode());
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

  // دالة تغيير وضع عدم الاتصال
  const handleToggleOfflineMode = () => {
    const newMode = toggleOfflineMode();
    setOfflineMode(newMode);
    
    toast(newMode ? 'تم تفعيل وضع عدم الاتصال' : 'تم إلغاء وضع عدم الاتصال', {
      description: newMode 
        ? 'لن يتم محاولة الاتصال بالإنترنت إلا عند الحاجة للنسخ الاحتياطي' 
        : 'سيتم التحقق من الاتصال بالإنترنت عند الحاجة',
    });
  };

  // دالة إنشاء نسخة احتياطية محلية
  const handleCreateLocalBackup = () => {
    createLocalBackup();
    setIsOpen(false);
  };

  // دالة إنشاء نسخة احتياطية سحابية
  const handleCreateCloudBackup = async () => {
    // إذا كان وضع عدم الاتصال مفعل، نطلب من المستخدم تعطيله أولاً
    if (offlineMode) {
      toast('الرجاء تعطيل وضع عدم الاتصال', {
        description: 'يجب أن يكون وضع عدم الاتصال معطلاً لعمل نسخة احتياطية سحابية',
      });
      return;
    }
    
    const success = await createCloudBackup();
    if (success) {
      setIsOpen(false);
    }
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
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
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
          {/* خيار وضع عدم الاتصال */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="offline-mode">وضع عدم الاتصال</Label>
              <p className="text-sm text-muted-foreground">
                تفعيل هذا الخيار يمنع التطبيق من الاتصال بالإنترنت
              </p>
            </div>
            <Switch
              id="offline-mode"
              checked={offlineMode}
              onCheckedChange={handleToggleOfflineMode}
            />
          </div>

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

          <Tabs defaultValue="local" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="local">نسخة محلية</TabsTrigger>
              <TabsTrigger value="cloud">نسخة سحابية</TabsTrigger>
            </TabsList>
            <TabsContent value="local" className="mt-3">
              <div className="flex flex-col space-y-3">
                <p className="text-sm text-muted-foreground">
                  النسخة المحلية تحفظ الملاحظات على جهازك ولا تحتاج اتصال بالإنترنت
                </p>
                <Button 
                  onClick={handleCreateLocalBackup} 
                  className="w-full"
                >
                  <Download className="ml-2 h-4 w-4" />
                  إنشاء نسخة احتياطية محلية
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="cloud" className="mt-3">
              <div className="flex flex-col space-y-3">
                <p className="text-sm text-muted-foreground">
                  النسخة السحابية تحفظ الملاحظات في السحابة الإلكترونية وتحتاج اتصال بالإنترنت
                </p>
                <Button 
                  onClick={handleCreateCloudBackup} 
                  className="w-full"
                  disabled={!isOnline || offlineMode}
                >
                  <UploadCloud className="ml-2 h-4 w-4" />
                  إنشاء نسخة احتياطية سحابية
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-2" />

          <div className="flex flex-col space-y-3">
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
