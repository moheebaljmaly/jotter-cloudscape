
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, deleteNote, Note } from "@/lib/note-service";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ShareNote } from "@/components/share-note";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const ViewNote = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      const noteData = getNote(id);
      if (noteData) {
        setNote(noteData);
      } else {
        toast({
          title: "عفواً، حدث خطأ",
          description: "لم نتمكن من العثور على الملاحظة",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [id, navigate, toast]);
  
  const handleDelete = () => {
    if (id) {
      if (deleteNote(id)) {
        toast({
          title: "تم الحذف",
          description: "تم حذف الملاحظة بنجاح",
        });
        navigate("/");
      }
    }
  };
  
  if (!note) {
    return (
      <Layout showBackButton>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showBackButton title={note.title}>
      <div className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate(`/edit/${note.id}`)}
                className="rounded-full"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <ShareNote note={note} />
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="note-details">
            <div className="text-sm text-muted-foreground flex justify-between mb-4">
              <span>إنشاء: {formatDate(note.createdAt)}</span>
              <span>تعديل: {formatDate(note.updatedAt)}</span>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="note-content whitespace-pre-wrap">
                {note.content}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الملاحظة بشكل نهائي ولن تتمكن من استعادتها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ViewNote;
