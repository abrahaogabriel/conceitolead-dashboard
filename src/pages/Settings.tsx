import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useToast } from '../context/ToastContext';
import { User, Mail, Camera, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
    const { user, profile } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        avatar_url: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile && user) {
            setFormData({
                full_name: profile.full_name || '',
                email: user.email || '',
                avatar_url: profile.avatar_url || ''
            });
        }
    }, [profile, user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const updates = {
                id: user.id,
                full_name: formData.full_name,
                avatar_url: formData.avatar_url,
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }

            showToast('Perfil atualizado com sucesso!', 'success');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            showToast('Erro ao atualizar perfil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const processFile = async (file: File) => {
        try {
            if (!user) throw new Error('Usuário não autenticado.');
            setUploading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Try to upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                    throw new Error("Bucket 'avatars' não encontrado. Por favor, crie-o no painel do Supabase com acesso público.");
                }
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
            showToast('Imagem carregada com sucesso!', 'success');

        } catch (error: any) {
            console.error('Upload Error:', error);
            showToast(`Erro no upload: ${error.message}`, 'error');
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) await processFile(file);
    };

    // Drag and Drop Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '2rem' }}>Meu Perfil</h1>

            <Card>
                <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>

                    {/* Header com Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2rem' }}>
                        <div style={{
                            position: 'relative',
                            width: '100px',
                            height: '100px',
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                backgroundColor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '4px solid white',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2.5rem', fontWeight: 600, color: '#64748b' }}>
                                        {formData.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Upload Button Overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: 'var(--primary-main)',
                                    color: 'white',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                title="Alterar foto"
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{formData.full_name || 'Usuário'}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{formData.email}</p>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                marginTop: '0.5rem'
                            }}>
                                {profile?.role || 'Usuário'}
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#334155' }}>Nome Completo</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#334155' }}>Email (Não editável)</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    value={formData.email}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#64748b',
                                        cursor: 'not-allowed',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Drag & Drop Area */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#334155' }}>Foto de Perfil</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${dragActive ? 'var(--primary-main)' : '#cbd5e1'}`,
                                    borderRadius: '8px',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: dragActive ? 'rgba(18, 182, 138, 0.05)' : '#f8fafc',
                                    transition: 'all 0.2s',
                                    transform: dragActive ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <Upload size={32} color={dragActive ? 'var(--primary-main)' : "#94a3b8"} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.9rem', color: dragActive ? 'var(--primary-main)' : '#64748b', fontWeight: 500 }}>
                                    {uploading ? 'Enviando...' : dragActive ? 'Solte a imagem aqui' : 'Arraste a sua foto para cá ou clique'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG (Max 2MB)</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button onClick={handleSave} disabled={loading || uploading}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </div>

                </div>
            </Card>
        </div>
    );
};
