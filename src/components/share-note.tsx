
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Note } from "@/lib/note-service";

interface ShareNoteProps {
  note: Note;
}

export function ShareNote({ note }: ShareNoteProps) {
  const handleShare = async () => {
    const text = `${note.title}\n\n${note.content}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
        return;
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
    
    // Fallback to clipboard copying
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الملاحظة إلى الحافظة",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "عفواً، حدث خطأ",
        description: "لم نتمكن من نسخ الملاحظة",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleShare}
      className="rounded-full"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
