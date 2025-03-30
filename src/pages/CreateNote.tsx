
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, saveNote } from "@/lib/note-service";
import { useToast } from "@/components/ui/use-toast";

const CreateNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEditMode = !!id;
  
  // Load note data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const note = getNote(id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      } else {
        toast({
          title: "عفواً، حدث خطأ",
          description: "لم نتمكن من العثور على الملاحظة",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [id, isEditMode, navigate, toast]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "العنوان مطلوب",
        description: "يرجى إضافة عنوان للملاحظة",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      saveNote({
        id: isEditMode ? id : undefined,
        title: title.trim(),
        content: content.trim(),
      });
      
      toast({
        title: isEditMode ? "تم تحديث الملاحظة" : "تم إنشاء الملاحظة",
        description: isEditMode ? "تم تحديث الملاحظة بنجاح" : "تم إنشاء ملاحظة جديدة بنجاح",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout showBackButton title={isEditMode ? "تعديل الملاحظة" : "ملاحظة جديدة"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            العنوان
          </label>
          <Input
            id="title"
            placeholder="عنوان الملاحظة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            المحتوى
          </label>
          <Textarea
            id="content"
            placeholder="اكتب ملاحظتك هنا..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default CreateNote;
