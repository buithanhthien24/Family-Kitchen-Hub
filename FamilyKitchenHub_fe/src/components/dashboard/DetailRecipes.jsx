import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import {
  getSimilarRecipes,
  getRecipeComments,
  createRecipeComment,
  uploadCommentMedia,
  updateRecipeComment,
  deleteRecipeComment,
} from "../../service/recipesApi";
import { getUsernameById } from "../../service/usersApi";
import { convertMediaUrl } from "../../utils/mediaUtils";
import "./../../styles/DetailRecipes.css";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [usernames, setUsernames] = useState({});
  const [fetchingUsernames, setFetchingUsernames] = useState(new Set()); // Track các userId đang được fetch
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState([]);
  const [editMediaToDelete, setEditMediaToDelete] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editNewFilePreviews, setEditNewFilePreviews] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomGalleryImages, setZoomGalleryImages] = useState([]);
  const [zoomCurrentIndex, setZoomCurrentIndex] = useState(0);

  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitial = (name, fallbackId) => {
    if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
    if (fallbackId) return String(fallbackId).charAt(0).toUpperCase();
    return "U";
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipe(res.data);
    };
    fetchRecipe();
  }, [id]);

  // Load comments for a specific page
  const loadCommentsForPage = useCallback(async (page) => {
    if (!id) return;

    try {
      setLoadingComments(true);
      // Gọi API với pagination params
      const data = await getRecipeComments(id, { page, size: 5 });
      const allComments = Array.isArray(data) ? data : [];

      // Nếu backend trả về nhiều hơn 5 comments (không hỗ trợ pagination),
      // FE tự phân trang: chỉ lấy 5 comments cho trang hiện tại
      const startIndex = page * 5;
      const endIndex = startIndex + 5;
      const displayedComments = allComments.slice(startIndex, endIndex);

      setComments(displayedComments);
      setCurrentPage(page);

      // Kiểm tra xem còn comment nào sau trang hiện tại không
      const hasMore = allComments.length > endIndex;
      setHasMorePages(hasMore);

      // Tính tổng số trang dựa trên tổng số comments
      const calculatedTotalPages = Math.ceil(allComments.length / 5) || 1;
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  // Load comments for this recipe - trang đầu tiên
  useEffect(() => {
    if (!id) return;
    loadCommentsForPage(0);
  }, [id, loadCommentsForPage]);

  // Tính toán các số trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Hiển thị tối đa 5 số trang

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= 5, hiển thị tất cả
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu nhiều hơn 5 trang, hiển thị logic thông minh
      if (currentPage < 3) {
        // Ở đầu: 0, 1, 2, 3, 4, ...
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage > totalPages - 4) {
        // Ở cuối: ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa: ..., currentPage-1, currentPage, currentPage+1, ...
        for (let i = currentPage - 1; i <= currentPage + 3; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Fetch username cho các comment chỉ có userId
  useEffect(() => {
    const loadUsernames = async () => {
      // Lọc các userId cần fetch: có userId, không có userName trong comment, chưa có trong usernames state, và chưa đang được fetch
      const missingIds = Array.from(
        new Set(
          comments
            .filter((c) => {
              if (!c.userId || c.userName) return false;
              // Đã có trong state (kể cả null - đã thử fetch nhưng fail)
              if (c.userId in usernames) return false;
              // Đang được fetch
              if (fetchingUsernames.has(c.userId)) return false;
              return true;
            })
            .map((c) => c.userId)
        )
      );

      if (missingIds.length === 0) return;

      // Đánh dấu các userId đang được fetch
      setFetchingUsernames((prev) => {
        const next = new Set(prev);
        missingIds.forEach((uid) => next.add(uid));
        return next;
      });

      try {
        const results = await Promise.all(
          missingIds.map(async (uid) => {
            try {
              const name = await getUsernameById(uid);
              return { uid, name, success: true };
            } catch (err) {
              // Log error nhưng không throw để không làm gián đoạn các request khác
              console.warn(`Failed to load username for user ${uid}:`, err.response?.status || err.message);
              return { uid, name: null, success: false };
            }
          })
        );

        // Cập nhật usernames state và xóa khỏi fetching set
        setUsernames((prev) => {
          const next = { ...prev };
          results.forEach(({ uid, name }) => {
            // Chỉ set nếu có name và đảm bảo name là string
            if (name && typeof name === 'string') {
              next[uid] = name;
            } else if (name && typeof name === 'object' && name.username) {
              // Nếu name là object, extract username
              next[uid] = String(name.username || name.userName || '');
            } else {
              // Đánh dấu đã thử fetch nhưng fail để không fetch lại
              next[uid] = null;
            }
          });
          return next;
        });

        // Xóa khỏi fetching set
        setFetchingUsernames((prev) => {
          const next = new Set(prev);
          missingIds.forEach((uid) => next.delete(uid));
          return next;
        });
      } catch (err) {
        console.error("Failed to load usernames", err);
        // Xóa khỏi fetching set khi có lỗi
        setFetchingUsernames((prev) => {
          const next = new Set(prev);
          missingIds.forEach((uid) => next.delete(uid));
          return next;
        });
      }
    };

    if (comments.length > 0) {
      loadUsernames();
    }
    // Chỉ phụ thuộc vào comments, không phụ thuộc vào usernames hoặc fetchingUsernames để tránh vòng lặp vô hạn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);

      // Lấy userId từ localStorage (cùng convention với Fridge / EditProfile)
      const userDataString = localStorage.getItem("user");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user?.id || userData?.id;

      // Upload media nếu có – backend trả về CommentMediaResponseDTO { url, type, ... }
      let mediaPayload = [];
      if (selectedFiles.length > 0) {
        try {
          setUploadingMedia(true);
          const uploaded = await Promise.all(
            selectedFiles.map((file) => uploadCommentMedia(file))
          );
          mediaPayload = uploaded
            .map((m) => (m?.url && m?.type ? { url: m.url, type: m.type } : null))
            .filter(Boolean);
        } finally {
          setUploadingMedia(false);
        }
      }

      const payload = {
        content: newComment.trim(),
        userId,
        ...(mediaPayload.length ? { media: mediaPayload } : {}),
      };

      await createRecipeComment(id, payload);
      // Reload về trang đầu tiên để đảm bảo comment mới hiển thị đúng
      await loadCommentsForPage(0);
      setNewComment("");
      setSelectedFiles([]);
      setMediaPreviews([]);
    } catch (err) {
      console.error("Failed to submit comment", err);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditMedia(comment.media || []);
    setEditMediaToDelete([]);
    setEditNewFiles([]);
    setEditNewFilePreviews([]);
  };

  const handleSaveEdit = async (commentId) => {
    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    try {
      // Upload new files if any
      let newMediaUploaded = [];
      if (editNewFiles.length > 0) {
        try {
          setUploadingMedia(true);
          const uploaded = await Promise.all(
            editNewFiles.map((file) => uploadCommentMedia(file))
          );
          newMediaUploaded = uploaded
            .map((m) => (m?.url && m?.type ? { url: m.url, type: m.type } : null))
            .filter(Boolean);
        } finally {
          setUploadingMedia(false);
        }
      }

      // Filter out deleted media from existing media
      const remainingMedia = editMedia.filter(
        (m) => !editMediaToDelete.includes(m.id || m.url)
      );

      // Merge remaining media with newly uploaded media
      const finalMedia = [...remainingMedia, ...newMediaUploaded];

      const payload = {
        content: editContent.trim(),
        userId,
        media: finalMedia,
      };

      await updateRecipeComment(commentId, payload);
      await loadCommentsForPage(currentPage); // Reload current page
      setEditingCommentId(null);
      setEditContent("");
      setEditMedia([]);
      setEditMediaToDelete([]);
      setEditNewFiles([]);
      setEditNewFilePreviews([]);
    } catch (err) {
      console.error("Failed to update comment", err);
      alert("Không thể cập nhật bình luận. Vui lòng thử lại.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditMedia([]);
    setEditMediaToDelete([]);
    setEditNewFiles([]);
    setEditNewFilePreviews([]);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return;
    }

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    try {
      await deleteRecipeComment(commentId, userId);
      await loadCommentsForPage(currentPage); // Reload current page
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert("Không thể xóa bình luận. Vui lòng thử lại.");
    }
  };

  // Zoom modal handlers
  const handleImageClick = (imageUrl, allImages, currentIndex) => {
    setZoomImage(imageUrl);
    setZoomGalleryImages(allImages);
    setZoomCurrentIndex(currentIndex);
  };

  const handleCloseZoom = () => {
    setZoomImage(null);
    setZoomGalleryImages([]);
    setZoomCurrentIndex(0);
  };

  const handleZoomPrev = () => {
    if (zoomCurrentIndex > 0) {
      const newIndex = zoomCurrentIndex - 1;
      setZoomCurrentIndex(newIndex);
      setZoomImage(zoomGalleryImages[newIndex]);
    }
  };

  const handleZoomNext = () => {
    if (zoomCurrentIndex < zoomGalleryImages.length - 1) {
      const newIndex = zoomCurrentIndex + 1;
      setZoomCurrentIndex(newIndex);
      setZoomImage(zoomGalleryImages[newIndex]);
    }
  };

  // Keyboard navigation for zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!zoomImage) return;

      if (e.key === "Escape") {
        handleCloseZoom();
      } else if (e.key === "ArrowLeft") {
        handleZoomPrev();
      } else if (e.key === "ArrowRight") {
        handleZoomNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomImage, zoomCurrentIndex, zoomGalleryImages]);

  // Load similar recipes – 7.2 Đề xuất món tương tự
  useEffect(() => {
    if (!id) return;

    const fetchSimilar = async () => {
      try {
        setLoadingSimilar(true);
        const data = await getSimilarRecipes(id);
        // Nếu backend chưa sort thì sort theo similarityScore giảm dần
        const sorted =
          Array.isArray(data)
            ? [...data].sort(
              (a, b) => (b.similarityScore || 0) - (a.similarityScore || 0)
            )
            : [];
        setSimilarRecipes(sorted);
      } catch (err) {
        console.error("Failed to load similar recipes", err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="recipe-detail-hl">
      <div className="top-nav">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="detail-container">
        {/* LEFT SIDE */}
        <div className="left-content">
          <div className="signature-tag">
            <span>Signature</span>
          </div>

          <h1 className="title_recipe">{recipe.title}</h1>

          {/* <p className="subtitle">Perfect For All Soup Bases</p> */}

          <div className="ingredients-table">
            {recipe.ingredients?.map((item, i) => (
              <div key={i} className="row">
                <span className="ingredient-name">{item.ingredientName}</span>
                <span className="ingredient-quantity">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="right-image">
          <img src={convertMediaUrl(recipe.imageUrl)} alt={recipe.title} />
          <div className="badge top-left">
            {recipe.mealType && <span>{recipe.mealType}</span>}
          </div>
          <div className="badge bottom-right">
            {recipe.cookingTimeMinutes && <span>{recipe.cookingTimeMinutes} phút</span>}
          </div>
        </div>

        <div className="instructions-section">
          <h2 className="instruction-title">Instructions</h2>
          <span>{recipe.instructions}</span>
        </div>
      </div>

      {/* Similar recipes suggestion */}
      <div className="similar-recipes-section">
        <h2 className="similar-title">Gợi ý món tương tự</h2>
        {loadingSimilar ? (
          <p>Đang tải gợi ý...</p>
        ) : similarRecipes.length === 0 ? (
          <p>Chưa có gợi ý phù hợp.</p>
        ) : (
          <div className="similar-grid">
            {similarRecipes.map((item) => (
              <div
                key={item.id}
                className="similar-card"
                onClick={() => navigate(`/manage/recipes/${item.id}`)}
              >
                <img
                  src={convertMediaUrl(item.imageUrl) || "/placeholder-recipe.jpg"}
                  alt={item.title}
                />
                <div className="similar-content">
                  <div className="similar-header">
                    <h3>{item.title}</h3>
                    {typeof item.similarityScore === "number" && (
                      <span className="similar-badge">
                        Gợi ý cho bạn
                      </span>
                    )}
                  </div>
                  <p className="similar-meta">
                    ⏱ {item.cookingTimeMinutes} min • {item.servings} servings
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="comments-section">
        <h2 className="comments-title">Bình luận</h2>

        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
            <textarea
              placeholder="Chia sẻ cảm nhận hoặc mẹo nấu món này..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />

            <div className="comment-attachments">
              <label className="comment-attach-label">
                <span>📎 Ảnh / Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                    setMediaPreviews(
                      files.map((file) => ({
                        name: file.name,
                        type: file.type,
                        url: URL.createObjectURL(file),
                      }))
                    );
                  }}
                />
              </label>

              {mediaPreviews.length > 0 && (
                <div className="comment-media-preview">
                  {mediaPreviews.map((m, idx) => (
                    <div key={idx} className="comment-media-thumb">
                      {m.type.startsWith("image") ? (
                        <img src={m.url} alt={m.name} />
                      ) : (
                        <video src={m.url} />
                      )}

                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={
                  submittingComment || uploadingMedia || !newComment.trim()
                }
              >
                {submittingComment || uploadingMedia
                  ? "Đang gửi..."
                  : "Gửi bình luận"}
              </button>

            </div>
          </div>

        </form>

        <div className="comments-list">
          {loadingComments ? (
            <p>Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          ) : (
            comments.map((c) => {
              const userDataString = localStorage.getItem("user");
              const userData = userDataString ? JSON.parse(userDataString) : null;
              const currentUserId = userData?.user?.id || userData?.id;
              const isOwner = currentUserId && c.userId && Number(currentUserId) === Number(c.userId);

              return (
                <div key={c.id} className="comment-item">
                  <div className="comment-avatar">
                    <span>
                      {getUserInitial(c.userName, c.userId)}
                    </span>
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <div className="comment-meta-left">
                        <span className="comment-author">
                          {c.userName ||
                            (typeof usernames[c.userId] === 'string' ? usernames[c.userId] : null) ||
                            `User #${c.userId || ""}`}
                        </span>
                        {c.createdAt && (
                          <span className="comment-date">
                            {formatDateTime(c.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Action buttons in top right - SVG icons */}
                      {isOwner && !editingCommentId && (
                        <div className="comment-actions-topright">
                          <button
                            className="btn-icon btn-edit-icon"
                            onClick={() => handleEditComment(c)}
                            title="Sửa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                              <path d="M15 5l4 4"></path>
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-delete-icon"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Xóa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit mode or display mode */}
                    {editingCommentId === c.id ? (
                      <div className="comment-edit-mode">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="edit-textarea"
                        />

                        {/* Existing Media Management */}
                        {editMedia.length > 0 && (
                          <div className="edit-existing-media">
                            <h4 className="edit-media-label">Ảnh hiện tại:</h4>
                            <div className="edit-media-grid">
                              {editMedia
                                .filter((m) => !editMediaToDelete.includes(m.id || m.url))
                                .map((m) => (
                                  <div key={m.id || m.url} className="edit-media-item">
                                    {m.type?.startsWith("video") ? (
                                      <video src={convertMediaUrl(m.url)} />
                                    ) : (
                                      <img src={convertMediaUrl(m.url)} alt="" />
                                    )}
                                    <button
                                      type="button"
                                      className="btn-remove-media"
                                      onClick={() => {
                                        setEditMediaToDelete([...editMediaToDelete, m.id || m.url]);
                                      }}
                                      title="Xóa ảnh này"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* New Media Upload */}
                        <div className="edit-new-media">
                          <label className="edit-upload-label">
                            <span>📎 Thêm ảnh/video mới</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setEditNewFiles([...editNewFiles, ...files]);
                                setEditNewFilePreviews([
                                  ...editNewFilePreviews,
                                  ...files.map((file) => ({
                                    name: file.name,
                                    type: file.type,
                                    url: URL.createObjectURL(file),
                                  })),
                                ]);
                              }}
                            />
                          </label>

                          {/* Preview new files */}
                          {editNewFilePreviews.length > 0 && (
                            <div className="edit-new-preview">
                              <h4 className="edit-media-label">Ảnh mới sẽ được thêm:</h4>
                              <div className="edit-media-grid">
                                {editNewFilePreviews.map((preview, idx) => (
                                  <div key={idx} className="edit-media-item">
                                    {preview.type.startsWith("image") ? (
                                      <img src={preview.url} alt={preview.name} />
                                    ) : (
                                      <video src={preview.url} />
                                    )}
                                    <button
                                      type="button"
                                      className="btn-remove-media"
                                      onClick={() => {
                                        const newFiles = [...editNewFiles];
                                        const newPreviews = [...editNewFilePreviews];
                                        newFiles.splice(idx, 1);
                                        newPreviews.splice(idx, 1);
                                        setEditNewFiles(newFiles);
                                        setEditNewFilePreviews(newPreviews);
                                      }}
                                      title="Xóa ảnh này"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="edit-actions">
                          <button
                            className="btn-save"
                            onClick={() => handleSaveEdit(c.id)}
                            disabled={!editContent.trim() || uploadingMedia}
                          >
                            {uploadingMedia ? "⏳ Đang tải..." : "💾 Lưu"}
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={handleCancelEdit}
                          >
                            ✖ Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{c.content}</p>
                    )}

                    {/* Media thumbnails - clickable for zoom */}
                    {!editingCommentId && Array.isArray(c.media) && c.media.length > 0 && (
                      <div className="comment-media-list">
                        {c.media.map((m, idx) => (
                          <div
                            key={m.id || m.url}
                            className="comment-media-thumb"
                            onClick={() => {
                              if (!m.type?.startsWith("video")) {
                                const allImages = c.media
                                  .filter((media) => !media.type?.startsWith("video"))
                                  .map((media) => convertMediaUrl(media.url));
                                const imageIndex = c.media
                                  .filter((media) => !media.type?.startsWith("video"))
                                  .findIndex((media) => media.id === m.id || media.url === m.url);
                                handleImageClick(convertMediaUrl(m.url), allImages, imageIndex);
                              }
                            }}
                            style={{ cursor: m.type?.startsWith("video") ? "default" : "pointer" }}
                          >
                            {m.type?.startsWith("video") ? (
                              <video src={convertMediaUrl(m.url)} controls />
                            ) : (
                              <img src={convertMediaUrl(m.url)} alt="" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}


          {/* Simple Load More Pagination */}
          {hasMorePages && (
            <div className="comment-load-more">
              <button
                onClick={() => loadCommentsForPage(currentPage + 1)}
                disabled={loadingComments}
                className="btn-load-more"
              >
                {loadingComments ? "Đang tải..." : "Tải thêm bình luận"}
              </button>
              <span className="page-info">Trang {currentPage + 1} / {totalPages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="zoom-modal-overlay" onClick={handleCloseZoom}>
          <button className="zoom-close-btn" onClick={handleCloseZoom} title="Đóng (ESC)">
            ✕
          </button>

          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed" className="zoom-image" />

            {zoomGalleryImages.length > 1 && (
              <>
                <button
                  className="zoom-nav-btn zoom-prev-btn"
                  onClick={handleZoomPrev}
                  disabled={zoomCurrentIndex === 0}
                  title="Ảnh trước (←)"
                >
                  ‹
                </button>
                <button
                  className="zoom-nav-btn zoom-next-btn"
                  onClick={handleZoomNext}
                  disabled={zoomCurrentIndex === zoomGalleryImages.length - 1}
                  title="Ảnh sau (→)"
                >
                  ›
                </button>
                <div className="zoom-counter">
                  {zoomCurrentIndex + 1} / {zoomGalleryImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
