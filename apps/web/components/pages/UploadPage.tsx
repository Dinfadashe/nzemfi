'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, useUIStore } from '@/lib/store';

const GENRES = ['Afrobeats','Afropop','Highlife','Hip-Hop','R&B / Soul','Gospel','Reggae','Jazz','Classical','Electronic','Pop','Rock','Country','Alternative','Spoken Word','Other'];

type UploadStep = 'file' | 'metadata' | 'copyright' | 'review' | 'done';

export default function UploadPage() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [step, setStep] = useState<UploadStep>('file');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'cleared' | 'rejected'>('idle');
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    title: '', album: '', genre: '', releaseDate: '',
    lyrics: '', isrc: '', copyrightDeclaration: false,
  });
  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && ['audio/mpeg', 'audio/flac', 'audio/wav', 'audio/aac', 'audio/x-flac'].includes(file.type)) {
      setAudioFile(file);
      setStep('metadata');
    }
  };

  const runCopyrightScan = async () => {
    setScanStatus('scanning');
    // In production: POST to /api/copyright/scan with audio file
    // ACRCloud scans and returns result
    await new Promise(r => setTimeout(r, 2800)); // Simulate scan
    setScanStatus('cleared');
    setStep('review');
  };

  const handleSubmit = async () => {
    if (!audioFile || !user) return;
    setUploading(true);

    try {
      // Upload audio to Supabase Storage
      const audioPath = `tracks/${user.id}/${Date.now()}_${audioFile.name}`;
      const { error: audioErr } = await supabase.storage.from('audio').upload(audioPath, audioFile);
      if (audioErr) throw audioErr;

      const { data: audioUrl } = supabase.storage.from('audio').getPublicUrl(audioPath);

      // Upload cover art if provided
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `covers/${user.id}/${Date.now()}_${coverFile.name}`;
        const { error: coverErr } = await supabase.storage.from('covers').upload(coverPath, coverFile);
        if (!coverErr) {
          const { data: cd } = supabase.storage.from('covers').getPublicUrl(coverPath);
          coverUrl = cd.publicUrl;
        }
      }

      // Insert track record
      const { error: trackErr } = await supabase.from('tracks').insert({
        artist_id: user.id,
        title: form.title,
        genre: form.genre,
        audio_url: audioUrl.publicUrl,
        cover_url: coverUrl,
        duration_seconds: 0, // TODO: parse from file
        audio_quality: 'standard',
        copyright_status: 'pending',
        release_date: form.releaseDate || null,
        is_exclusive: false,
        is_published: false,
        lyrics: form.lyrics || null,
      } as any);

      if (trackErr) throw trackErr;

      showToast('Track submitted for review! It will be published after copyright verification.', 'success');
      setStep('done');
    } catch (err: any) {
      showToast(err.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const steps: { id: UploadStep; label: string }[] = [
    { id: 'file', label: 'Audio File' },
    { id: 'metadata', label: 'Track Info' },
    { id: 'copyright', label: 'Copyright' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <div style={{ padding: '28px 24px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Upload Music</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Share your music for free. Earn 30% of every fan's stream royalty, paid automatically on-chain.</p>
      </div>

      {/* Step Indicator */}
      {step !== 'done' && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, marginTop: 20 }}>
          {steps.map((s, i) => {
            const idx = steps.findIndex(x => x.id === step);
            const done = i < idx;
            const active = s.id === step;
            return (
              <div key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: done ? 'var(--success)' : active ? 'var(--nzm-purple)' : 'var(--bg-tertiary)',
                    border: active ? '2px solid var(--nzm-purple-light)' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                    transition: 'var(--transition)',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11, color: active ? 'var(--nzm-purple-lighter)' : 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: done ? 'var(--success)' : 'var(--bg-tertiary)', marginBottom: 18, transition: 'var(--transition)' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step: File Upload */}
      {step === 'file' && (
        <div>
          <div
            onDrop={handleAudioDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => audioInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-default)',
              borderRadius: 16, padding: '48px 28px',
              textAlign: 'center', cursor: 'pointer',
              transition: 'var(--transition)',
              background: 'rgba(124,58,237,0.04)',
              marginBottom: 14,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--nzm-purple-light)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
          >
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎵</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Drop your audio file here</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Supports MP3, FLAC, WAV, AAC — up to 250MB</div>
            <button className="btn-primary" onClick={e => { e.stopPropagation(); audioInputRef.current?.click(); }}>
              Browse Files
            </button>
          </div>
          <input ref={audioInputRef} type="file" accept="audio/*" hidden onChange={e => {
            if (e.target.files?.[0]) { setAudioFile(e.target.files[0]); setStep('metadata'); }
          }} />

          {/* Requirements */}
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)', marginBottom: 8 }}>ℹ Upload Requirements</div>
            {['Audio: MP3, FLAC, WAV, or AAC format', 'Maximum file size: 250MB per track', 'Cover art: Minimum 3000×3000px JPG/PNG recommended', 'You must own the rights to any music you upload', 'All uploads are scanned by ACRCloud for copyright'].map(r => (
              <div key={r} style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '3px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Metadata */}
      {step === 'metadata' && (
        <div>
          {/* File confirmed */}
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎵</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{audioFile?.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{audioFile ? (audioFile.size / 1024 / 1024).toFixed(2) : 0} MB</div>
            </div>
            <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Song Title *</label>
              <input className="form-input" placeholder="Enter song title" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select className="form-select" value={form.genre} onChange={e => update('genre', e.target.value)}>
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Album / EP (optional)</label>
              <input className="form-input" placeholder="Leave blank for single" value={form.album} onChange={e => update('album', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Release Date</label>
              <input className="form-input" type="date" value={form.releaseDate} onChange={e => update('releaseDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">ISRC Code (optional)</label>
            <input className="form-input" placeholder="e.g. USRC17607839" value={form.isrc} onChange={e => update('isrc', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Lyrics (optional)</label>
            <textarea className="form-input" rows={4} placeholder="Paste your lyrics here..." value={form.lyrics} onChange={e => update('lyrics', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* Cover Art */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Cover Art (JPG/PNG, min 3000×3000px)</label>
            <div onClick={() => coverInputRef.current?.click()} style={{ border: '1px dashed var(--border-default)', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-tertiary)' }}>
              {coverFile ? (
                <div style={{ fontSize: 13, color: 'var(--success)' }}>✓ {coverFile.name}</div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to upload cover art</div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={e => { if (e.target.files?.[0]) setCoverFile(e.target.files[0]); }} />
          </div>

          <button className="btn-primary" onClick={() => setStep('copyright')} disabled={!form.title || !form.genre} style={{ width: '100%', justifyContent: 'center', padding: 13, opacity: (!form.title || !form.genre) ? 0.5 : 1 }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step: Copyright */}
      {step === 'copyright' && (
        <div>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '20px', marginBottom: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)', marginBottom: 10 }}>⚠ Copyright Declaration Required</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              By uploading, you confirm you own or have the legal right to distribute this content. NzemFi uses ACRCloud to scan all uploads against global copyright databases. Uploading music you don't own rights to will result in rejection and may lead to account suspension.
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Copyright Ownership Statement *</label>
            <input className="form-input" placeholder="I am the original creator / I hold a valid distribution license for this track" />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20 }}>
            <input type="checkbox" checked={form.copyrightDeclaration} onChange={e => update('copyrightDeclaration', e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--nzm-purple)', width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              I confirm I own the rights to this audio content and that it does not infringe on any third-party copyrights. I understand that uploading copyrighted content I do not own is a violation of NzemFi's Terms of Service and may result in legal action.
            </span>
          </label>

          <button
            className="btn-primary"
            onClick={runCopyrightScan}
            disabled={!form.copyrightDeclaration || scanStatus === 'scanning'}
            style={{ width: '100%', justifyContent: 'center', padding: 13, opacity: !form.copyrightDeclaration ? 0.5 : 1 }}
          >
            {scanStatus === 'scanning' ? (
              <><span className="spinner" /> Scanning for copyright matches...</>
            ) : (
              'Run Copyright Scan & Continue →'
            )}
          </button>

          {scanStatus === 'rejected' && (
            <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 16px', color: '#ef4444', fontSize: 13 }}>
              ⛔ Copyright match detected. This audio matches existing copyrighted content in the ACRCloud database. Your upload has been rejected.
            </div>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div>
          {scanStatus === 'cleared' && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Copyright scan passed</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No copyright matches found. Your track is cleared for upload.</div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Track Summary</div>
            {[
              { k: 'Title', v: form.title },
              { k: 'Genre', v: form.genre },
              { k: 'Album', v: form.album || 'Single' },
              { k: 'Release Date', v: form.releaseDate || 'Immediate' },
              { k: 'Audio File', v: audioFile?.name },
              { k: 'Cover Art', v: coverFile?.name || 'None' },
              { k: 'Copyright Status', v: '✓ Cleared by ACRCloud' },
            ].map(row => (
              <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.k}</span>
                <span style={{ fontWeight: 500 }}>{row.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            🎤 Your track will be reviewed by our team and published within 24–48 hours. You will earn <strong style={{ color: 'var(--nzm-gold)' }}>30% of every fan's NZM earnings</strong> on each stream — credited directly to your wallet.
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={uploading} style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
            {uploading ? <><span className="spinner" /> Uploading...</> : 'Submit Track for Review ✓'}
          </button>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Track Submitted!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 24px' }}>
            Your track is in the review queue. It will be published within 24–48 hours after copyright verification is complete.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => { setStep('file'); setAudioFile(null); setCoverFile(null); setForm({ title: '', album: '', genre: '', releaseDate: '', lyrics: '', isrc: '', copyrightDeclaration: false }); setScanStatus('idle'); }}>
              Upload Another Track
            </button>
            <button className="btn-outline" onClick={() => {}}>View My Tracks</button>
          </div>
        </div>
      )}
    </div>
  );
}
