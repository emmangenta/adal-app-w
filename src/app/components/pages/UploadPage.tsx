"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Upload, FileText, X, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import { Input } from "../ui/input";
import type { StoredDeck } from "../../context/AppContext";

export function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deckName, setDeckName] = useState("");
  const router = useRouter();
  const { userId, addDeck } = useApp();

  if (!userId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to be logged in to upload documents.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    if (files.length + droppedFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }

    setFiles([...files, ...droppedFiles].slice(0, 3));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }

    setFiles([...files, ...selectedFiles].slice(0, 3));
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("deckName", deckName.trim());
      formData.append("userId", userId);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const processResponse = await fetch("/api/process-documents", {
        method: "POST",
        body: formData,
      });

      if (!processResponse.ok) {
        const err = await processResponse.json().catch(() => ({}));
        throw new Error(err.error || "Failed to process documents");
      }

      const processData = await processResponse.json();
      const raw = processData.deck as StoredDeck;
      const deck: StoredDeck = { ...raw, userId };
      addDeck(deck);

      toast.success("Study materials created successfully!", {
        icon: <Sparkles className="size-4" />,
      });

      setFiles([]);
      setDeckName("");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/app/study");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process documents");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
        <p className="text-muted-foreground">
          Upload up to 3 PDF or Word documents to generate study materials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deck Name</CardTitle>
          <CardDescription>Give your deck a meaningful name</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., Biology Chapter 5, Spanish Vocabulary"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>Drag and drop files or click to browse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.docx"
              multiple
              onChange={handleFileInput}
              disabled={isLoading}
            />
            <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground">
              PDF or Word documents (max 3 files)
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Uploaded Files ({files.length}/3)</h3>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                  >
                    <X className="size-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={files.length === 0 || isLoading || !deckName.trim()}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Generate Study Materials
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-purple-600">1</span>
            </div>
            <div>
              <p className="font-medium">AI Analysis</p>
              <p className="text-sm text-muted-foreground">
                Our AI reads and understands your documents
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Content Generation</p>
              <p className="text-sm text-muted-foreground">
                Generates quizzes, flashcards, and study guides
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-green-600">3</span>
            </div>
            <div>
              <p className="font-medium">Ready to Study</p>
              <p className="text-sm text-muted-foreground">
                Start learning with your personalized materials
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
