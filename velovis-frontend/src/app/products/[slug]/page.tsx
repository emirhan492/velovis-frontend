"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import api from 'src/app/lib/api';
import { useAuthStore } from 'src/app/lib/store/auth.store';
import { useCartStore } from 'src/app/lib/store/cart.store';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, TrashIcon, PencilSquareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// --- TİP TANIMLAMALARI ---
interface Comment {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string; 
  editedByAdmin: boolean;
  userId: string;
  user: { firstName: string; lastName: string };
}

interface Product {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  stockQuantity: number;
  primaryPhotoUrl: string | null;
  category?: { name: string };
  photos: { id: string; url: string; isPrimary: boolean }[];
  comments?: Comment[];
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = (params.id || params.slug) as string; 
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Görsel
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sepet
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Yorum
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Düzenleme
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const { isAuthenticated, user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  const isAdmin = user?.roles?.includes('ADMIN');

  const averageRating = useMemo(() => {
    if (!product?.comments || product.comments.length === 0) return 0;
    const total = product.comments.reduce((acc, curr) => acc + curr.rating, 0);
    return total / product.comments.length;
  }, [product?.comments]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      const data = response.data;
      setProduct(data);
      
      let photos: string[] = [];
      if (data.primaryPhotoUrl) photos.push(data.primaryPhotoUrl);
      if (data.photos && data.photos.length > 0) {
         const galleryUrls = data.photos.map((p: any) => p.url);
         photos = Array.from(new Set([...photos, ...galleryUrls]));
      }
      if (photos.length === 0) photos.push("https://picsum.photos/800/1000?grayscale");
      setAllPhotos(photos);

    } catch (err) {
      console.error("Ürün bulunamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  // --- TARİH FORMATLAYICI ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const changeImage = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  };
  const handleNext = () => changeImage((currentIndex + 1) % allPhotos.length);
  const handlePrev = () => changeImage((currentIndex - 1 + allPhotos.length) % allPhotos.length);
  const handleThumbnailClick = (index: number) => changeImage(index);

  const handleAddToCart = async () => {
    setError(null); setSuccess(null);
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!selectedSize) { setError("Lütfen bir beden seçiniz."); return; }
    if (!product) return;

    const itemInCart = cartItems.find((item) => item.product.id === product.id);
    const qtyInCart = itemInCart ? itemInCart.quantity : 0;
    if ((qtyInCart + quantity) > product.stockQuantity) {
        setError("Stok yetersiz."); return;
    }

    try {
      await addItem(product.id, quantity, selectedSize);
      setSuccess(`${product.name} (${selectedSize}) sepete eklendi.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) { setError(err.message || "Hata oluştu."); }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post(`/products/${product?.id}/comments`, { rating: commentRating, content: commentText });
      setCommentText(""); setCommentRating(5);
      fetchProduct();
      alert("Yorumunuz eklendi.");
    } catch (err) { alert("Hata oluştu."); } 
    finally { setIsSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if(!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/comments/${commentId}`);
      fetchProduct();
    } catch (error) { alert("Silme işlemi başarısız."); }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  const saveEdit = async (commentId: string) => {
    try {
      await api.patch(`/products/comments/${commentId}`, { content: editContent, rating: editRating });
      setEditingCommentId(null);
      fetchProduct();
    } catch (error) { alert("Güncelleme başarısız."); }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-pulse tracking-widest text-sm uppercase">Yükleniyor...</div></div>;
  if (!product) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Ürün Bulunamadı</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        
        {/* ÜRÜN DETAYI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-32">
          {/* SOL: Galeri */}
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden group border border-zinc-800">
              <Image src={allPhotos[currentIndex]} alt={product.name} fill className={`object-cover transition-all duration-700 ease-in-out ${isAnimating ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0 group-hover:scale-110'}`} priority />
              {allPhotos.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronLeftIcon className="w-6 h-6" /></button>
                  <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronRightIcon className="w-6 h-6" /></button>
                </>
              )}
            </div>
            {allPhotos.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allPhotos.map((url, index) => (
                  <button key={index} onClick={() => handleThumbnailClick(index)} className={`relative w-20 h-24 flex-shrink-0 overflow-hidden border transition-all duration-300 ${currentIndex === index ? 'border-white opacity-100 scale-105' : 'border-zinc-800 opacity-50 hover:opacity-100'}`}>
                    <Image src={url} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: Bilgiler */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4 border-b border-zinc-800 pb-8">
              {product.category && <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{product.category.name}</span>}
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-6">
                 <p className="text-2xl md:text-3xl font-mono text-zinc-300">₺{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                 <div className="flex items-center text-yellow-600 gap-1 cursor-help" title={`Ortalama: ${averageRating.toFixed(1)}`}>
                    {[...Array(5)].map((_, i) => (
                        <StarIconSolid key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'opacity-100' : 'opacity-30'}`} />
                    ))}
                    <span className="text-xs text-zinc-500 ml-1 font-mono border-b border-zinc-800 pb-0.5">
                      ({product.comments?.length || 0})
                    </span>
                 </div>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed font-light text-lg">{product.longDescription}</p>
            <div className="space-y-4 pt-4">
               <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Beden Seçin</span></div>
               <div className="flex gap-4">
                  {AVAILABLE_SIZES.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 flex items-center justify-center border text-sm font-medium transition-all duration-300 ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'}`}>{size}</button>
                  ))}
               </div>
               {!selectedSize && error === "Lütfen bir beden seçiniz." && <p className="text-red-500 text-xs mt-2 animate-pulse">Lütfen sepete eklemeden önce beden seçiniz.</p>}
            </div>
            <div className="flex items-center justify-between border border-zinc-800 p-4 mt-4">
               <span className="text-zinc-500 uppercase tracking-widest text-xs">Adet</span>
               <div className="flex items-center space-x-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl hover:text-zinc-300">-</button>
                  <span className="text-lg font-mono w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className="text-xl hover:text-zinc-300">+</button>
               </div>
            </div>
            <div className="pt-6 space-y-4">
              <button onClick={handleAddToCart} disabled={product.stockQuantity <= 0 || isCartLoading} className={`w-full py-5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 border border-white ${product.stockQuantity > 0 ? 'hover:bg-white hover:text-black text-white' : 'opacity-50 cursor-not-allowed text-zinc-500 border-zinc-800'}`}>
                {isCartLoading ? 'Ekleniyor...' : (product.stockQuantity > 0 ? 'Sepete Ekle' : 'Tükendi')}
              </button>
              {error && error !== "Lütfen bir beden seçiniz." && <div className="p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center uppercase tracking-wide">{error}</div>}
              {success && <div className="p-3 border border-green-900/50 bg-green-900/10 text-green-400 text-xs text-center uppercase tracking-wide">{success}</div>}
            </div>
          </div>
        </div>

        {/* ================= YORUMLAR BÖLÜMÜ ================= */}
        <div className="border-t border-zinc-900 pt-24">
            <h2 className="text-2xl font-light uppercase tracking-widest mb-12 text-center">Değerlendirmeler</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* FORM */}
                <div className="border border-zinc-800 p-8 bg-zinc-950/50 h-fit sticky top-32">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Bir Yorum Yaz</h3>
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitComment} className="space-y-6">
                            <div>
                                <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">Puanınız</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setCommentRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                                            {star <= commentRating ? <StarIconSolid className="w-6 h-6 text-yellow-600" /> : <StarIcon className="w-6 h-6 text-zinc-700" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">Deneyiminiz</label>
                                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={4} required placeholder="Düşünceleriniz..." className="w-full bg-black border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors text-sm"></textarea>
                            </div>
                            <button type="submit" disabled={isSubmittingComment} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50">
                                {isSubmittingComment ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-zinc-500 text-sm">Yorum yapabilmek için giriş yapmalısınız.</p>
                            <button onClick={() => router.push('/login')} className="border-b border-white pb-1 text-xs uppercase tracking-widest hover:text-zinc-400">Giriş Yap</button>
                        </div>
                    )}
                </div>

                {/* YORUM LİSTESİ */}
                <div className="space-y-8">
                    {(!product.comments || product.comments.length === 0) ? (
                        <div className="text-center py-12 border border-zinc-800 border-dashed">
                           <p className="text-zinc-500 text-sm italic">Henüz yorum yapılmamış.</p>
                        </div>
                    ) : (
                        product.comments.map((comment) => {
                            const isOwner = user?.id === comment.userId;
                            const canEdit = isOwner || isAdmin;
                            const isEditing = editingCommentId === comment.id;
                            
                            const isEdited = comment.createdAt !== comment.updatedAt;

                            return (
                                <div key={comment.id} className="border-b border-zinc-900 pb-8 last:border-0 group hover:bg-zinc-900/20 p-4 transition-colors rounded-sm">
                                    
                                    {/* BAŞLIK */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-white font-medium text-sm block mb-1">
                                                {comment.user.firstName} {comment.user.lastName.charAt(0)}.
                                            </span>
                                            {/* TARİH GÖSTERİMİ*/}
                                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wide">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        
                                        {/* İŞLEMLER */}
                                        {!isEditing && (
                                            <div className="flex items-center gap-4">
                                                <div className="flex text-yellow-600 gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIconSolid key={i} className={`w-3 h-3 ${i < comment.rating ? 'opacity-100' : 'opacity-20'}`} />
                                                    ))}
                                                </div>
                                                {canEdit && (
                                                    <div className="flex gap-2 ml-2 border-l border-zinc-800 pl-3">
                                                        <button onClick={() => startEditing(comment)} className="text-zinc-500 hover:text-blue-400 transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-zinc-500 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* İÇERİK */}
                                    {isEditing ? (
                                        <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                            <div className="flex gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} type="button" onClick={() => setEditRating(star)}>
                                                        <StarIconSolid className={`w-4 h-4 ${star <= editRating ? 'text-yellow-500' : 'text-zinc-800'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full bg-black border border-zinc-700 p-3 text-white text-sm focus:outline-none focus:border-blue-500" />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit(comment.id)} className="flex items-center gap-1 px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200"><CheckIcon className="w-3 h-3"/> Kaydet</button>
                                                <button onClick={() => setEditingCommentId(null)} className="flex items-center gap-1 px-3 py-1 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider hover:text-white"><XMarkIcon className="w-3 h-3"/> İptal</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                          <p className="text-zinc-400 text-sm leading-relaxed font-light break-words">
                                              {comment.content}
                                          </p>
                                          
                                          {/* DÜZENLENDİ BİLGİSİ */}
                                          {isEdited && (
                                            <div className="mt-3 text-[10px] text-zinc-600 italic flex items-center gap-1">
                                               <PencilSquareIcon className="w-3 h-3" />
                                               {comment.editedByAdmin ? (
                                                  <span>Admin tarafından düzenlendi &bull; {formatDate(comment.updatedAt)}</span>
                                               ) : (
                                                  <span>Düzenlendi &bull; {formatDate(comment.updatedAt)}</span>
                                               )}
                                            </div>
                                          )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}