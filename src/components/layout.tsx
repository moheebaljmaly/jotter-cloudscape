
import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, WifiOff } from "lucide-react";
import { BackupDialog } from "@/components/backup-dialog";
import { getOfflineMode } from "@/lib/backup-service";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showAddButton?: boolean;
}

export function Layout({ 
  children, 
  title = "مذكراتي", 
  showBackButton = false,
  showAddButton = false
}: LayoutProps) {
  const navigate = useNavigate();
  const [offlineMode, setOfflineMode] = useState(getOfflineMode());
  
  // تحديث حالة وضع عدم الاتصال عند التغيير
  useEffect(() => {
    const checkOfflineMode = () => {
      setOfflineMode(getOfflineMode());
    };
    
    // التحقق من حالة وضع عدم الاتصال كل ثانية
    const interval = setInterval(checkOfflineMode, 1000);
    
    // التنظيف عند إزالة المكون
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="bg-background sticky top-0 z-10 border-b px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
            
            {/* إظهار علامة وضع عدم الاتصال */}
            {offlineMode && (
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full text-xs">
                <WifiOff className="h-3 w-3" />
                <span>وضع عدم الاتصال</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {showAddButton && (
              <Button 
                size="icon"
                onClick={() => navigate("/create")}
                className="rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            <BackupDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 max-w-5xl w-full mx-auto">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} تطبيق المذكرات | تطوير م/مهيب الجمالي</p>
      </footer>
    </div>
  );
}
