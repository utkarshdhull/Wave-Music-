import { useState, useEffect } from "react";
import { uploadSong } from "../api/songApi";
import { StatusMessage } from "../components/ui/StatusMessage";
import { UploadCloud, Music, Image as ImageIcon, ArrowUpRight } from "lucide-react";

const initialForm = {
  album: "",
  artist: "",
  duration: "",
  genre: "",
  title: ""
};

export function Upload() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioName, setAudioName] = useState("");
  const [coverName, setCoverName] = useState("");

  const [isDragOverAudio, setIsDragOverAudio] = useState(false);
  const [isDragOverCover, setIsDragOverCover] = useState(false);

  // Mock progress simulation
  useEffect(() => {
    let interval;
    if (isSubmitting) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.floor(Math.random() * 12) + 6;
          return Math.min(prev + increment, 90);
        });
      }, 250);
    } else {
      setUploadProgress(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  // Audio drag & drop handlers
  const handleDragOverAudio = (e) => {
    e.preventDefault();
    setIsDragOverAudio(true);
  };
  
  const handleDragLeaveAudio = () => {
    setIsDragOverAudio(false);
  };
  
  const handleDropAudio = (e) => {
    e.preventDefault();
    setIsDragOverAudio(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav") || file.name.endsWith(".aac")) {
        setAudioFile(file);
        setAudioName(file.name);
      } else {
        setError("Invalid audio file format.");
      }
    }
  };

  // Cover drag & drop handlers
  const handleDragOverCover = (e) => {
    e.preventDefault();
    setIsDragOverCover(true);
  };
  
  const handleDragLeaveCover = () => {
    setIsDragOverCover(false);
  };
  
  const handleDropCover = (e) => {
    e.preventDefault();
    setIsDragOverCover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setCoverFile(file);
        setCoverName(file.name);
      } else {
        setError("Invalid image file format.");
      }
    }
  };

  // File manual select handlers
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioName(file.name);
    }
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverName(file.name);
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!audioFile) {
      setError("Audio file is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        formData.append(key, value);
      }
    });

    formData.append("audio", audioFile);
    
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      await uploadSong(formData);
      
      setUploadProgress(100);
      setTimeout(() => {
        setForm(initialForm);
        setAudioName("");
        setCoverName("");
        setAudioFile(null);
        setCoverFile(null);
        setShowSuccess(true);
        setIsSubmitting(false);
      }, 550);

    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Upload failed");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-8 md:py-10">
      <h2 className="text-3xl font-black tracking-tight">Upload Tracks</h2>
      
      {showSuccess ? (
        <div className="mt-8 rounded-2xl glass-panel p-10 text-center shadow-2xl border border-white/5 bg-white/[0.01] animate-scale-in flex flex-col items-center justify-center min-h-[400px]">
          {/* Animated Green Circle Checkmark */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6">
            <svg
              className="h-10 w-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline
                className="animate-draw-check"
                points="20 6 9 17 4 12"
              />
            </svg>
          </div>
          
          <h3 className="text-2xl font-black text-white tracking-tight">
            Upload Successful!
          </h3>
          <p className="mt-2.5 max-w-md text-sm font-semibold text-zinc-400 leading-relaxed">
            Your track has been processed and successfully cataloged. It is now instantly available for streaming and playlist generation.
          </p>
          
          <button
            type="button"
            onClick={() => {
              setShowSuccess(false);
              setError("");
              setStatus("");
            }}
            className="mt-8 rounded-full bg-white text-black hover:bg-zinc-200 active:scale-95 px-8 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-200"
          >
            Upload Another Track
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative mt-8 overflow-hidden rounded-2xl glass-panel p-6 md:p-8 shadow-2xl border border-white/5 bg-white/[0.01]">
          {/* Progress Bar Blur Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md transition-all duration-300">
              <div className="relative flex h-24 w-24 items-center justify-center">
                {/* Outer pulsing neon ring */}
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-wave-accent/40" />
                {/* Spinner */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/5 border-t-wave-accent border-r-wave-accent/40" />
                <Music className="absolute text-wave-accent" size={24} />
              </div>
              
              <h3 className="mt-6 text-lg font-black text-white tracking-wide">
                Uploading "{form.title || "Your Track"}"
              </h3>
              <p className="mt-1.5 text-xs text-zinc-400 font-semibold uppercase tracking-widest">
                Please keep this page open
              </p>
              
              {/* Progress Bar Container */}
              <div className="mt-8 w-64 px-4">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  <span>Sending catalog data</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-wave-accent shadow-[0_0_8px_rgba(29,185,84,0.5)] transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <StatusMessage variant="success">{status}</StatusMessage>
          <StatusMessage variant="error">{error}</StatusMessage>

          {/* Input Fields Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="upload-title">
                Track Title *
              </label>
              <input
                id="upload-title"
                name="title"
                value={form.title}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                placeholder="e.g. High Rated Gabru"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="upload-artist">
                Artist / Performer *
              </label>
              <input
                id="upload-artist"
                name="artist"
                value={form.artist}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                placeholder="e.g. Guru Randhawa"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="upload-album">
                Album Name (Optional)
              </label>
              <input
                id="upload-album"
                name="album"
                value={form.album}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                placeholder="e.g. Singles Collection"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="upload-genre">
                Genre / Style
              </label>
              <input
                id="upload-genre"
                name="genre"
                value={form.genre}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                placeholder="e.g. Punjabi, Bollywood, Pop"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="upload-duration">
                Duration (Seconds)
              </label>
              <input
                id="upload-duration"
                name="duration"
                type="number"
                min="0"
                value={form.duration}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                placeholder="e.g. 180"
              />
            </div>
          </div>

          {/* File Dropzones */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            
            {/* Custom Cover Art Upload Zone */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Cover Artwork
              </span>
              <div
                onDragOver={handleDragOverCover}
                onDragLeave={handleDragLeaveCover}
                onDrop={handleDropCover}
                className={`mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 min-h-[140px] relative ${
                  isDragOverCover
                    ? "border-wave-accent bg-wave-accent/5 scale-[1.02] shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                    : "border-white/10 hover:border-wave-accent/40 bg-black/35 hover:bg-black/50"
                }`}
              >
                <label className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center p-4">
                  <ImageIcon size={28} className={isDragOverCover ? "text-wave-accent animate-pulse" : "text-zinc-500"} />
                  <span className="text-xs font-bold text-white mt-3 truncate max-w-full">
                    {coverName ? coverName : "Drag & drop cover or Browse"}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">
                    JPEG, PNG (Recommended 500x500)
                  </span>
                  <input
                    name="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Custom Audio File Upload Zone */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Audio File *
              </span>
              <div
                onDragOver={handleDragOverAudio}
                onDragLeave={handleDragLeaveAudio}
                onDrop={handleDropAudio}
                className={`mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 min-h-[140px] relative ${
                  isDragOverAudio
                    ? "border-wave-accent bg-wave-accent/5 scale-[1.02] shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                    : "border-white/10 hover:border-wave-accent/40 bg-black/35 hover:bg-black/50"
                }`}
              >
                <label className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center p-4">
                  <Music size={28} className={isDragOverAudio ? "text-wave-accent animate-pulse" : "text-zinc-500"} />
                  <span className="text-xs font-bold text-white mt-3 truncate max-w-full">
                    {audioName ? audioName : "Drag & drop audio or Browse"}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">
                    MP3, WAV, AAC formats
                  </span>
                  <input
                    name="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting || !audioFile}
            className="mt-8 flex items-center justify-center gap-2 rounded-full bg-wave-accent px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-wave-accent/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Uploading song..." : "Upload Track"}
            <ArrowUpRight size={15} strokeWidth={3} />
          </button>
        </form>
      )}
    </section>
  );
}
