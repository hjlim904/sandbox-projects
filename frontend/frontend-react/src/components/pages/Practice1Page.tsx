import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {FileText, Plus, MessageSquare, Trash2, Edit3, Calendar, User, ChevronLeft, ChevronRight, Send, X, RefreshCw, Clock} from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: string;
}

interface PostDetail {
  post: Post;
  comments: Comment[];
}

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

const BASE_URL = API_BASE_URL;

export default function Practice1Page() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostDetail | null>(null);
  //const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = useCallback(async (targetPage: number = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts?page=${targetPage}&size=5`);
      if (res.ok) {
        const data: PageResponse<Post> = await res.json();
        setPosts(data.items);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // 게시글 조회 (댓글)
  const openDetailModal = async (postId: number) => {
    //setIsDetailLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${postId}`);
      if (res.ok) {
        const data: PostDetail = await res.json();
        setSelectedPostDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      //setIsDetailLoading(false);
    }
  };

  // 게시글 작성 또는 수정
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert(t("practice1.modal.alertFillAll"));
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingPost;
      const url = isEdit
        ? `${BASE_URL}/api/posts/${editingPost.id}`
        : `${BASE_URL}/api/posts`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: formTitle, 
          content: formContent,
          author: user || "Anonymous" 
        }),
      });

      if (res.ok) {
        setIsWriteModalOpen(false);
        setEditingPost(null);
        setFormTitle("");
        setFormContent("");
        fetchPosts(page);
        if (isEdit && selectedPostDetail) {
          openDetailModal(selectedPostDetail.post.id);
        }
      } else {
        alert(t("common.error"));
      }
    } catch (err) {
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm(t("practice1.detail.deleteConfirm"))) return;

    try {
      const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (selectedPostDetail?.post.id === postId) {
          setSelectedPostDetail(null);
        }
        fetchPosts(page);
      } else {
        alert(t("common.error"));
      }
    } catch (err) {
      alert(t("common.error"));
    }
  };

  // 댓글 작성
  const handleAddComment = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPostDetail || !token) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/posts/${selectedPostDetail.post.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            content: commentInput,
            author: user || "Anonymous"
          }),
        }
      );

      if (res.ok) {
        setCommentInput("");
        openDetailModal(selectedPostDetail.post.id);
      } else {
        alert(t("common.error"));
      }
    } catch (err) {
      alert(t("common.error"));
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPostDetail || !token || !window.confirm(t("practice1.detail.deleteConfirm"))) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/posts/${selectedPostDetail.post.id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        openDetailModal(selectedPostDetail.post.id);
      }
    } catch (err) {
      alert(t("common.error"));
    }
  };

  const openWriteModal = (postToEdit?: Post) => {
    if (postToEdit) {
      setEditingPost(postToEdit);
      setFormTitle(postToEdit.title);
      setFormContent(postToEdit.content);
    } else {
      setEditingPost(null);
      setFormTitle("");
      setFormContent("");
    }
    setIsWriteModalOpen(true);
  };

  const isAdmin = user === "admin";

  return (
    <div className="space-y-6">
      {/* 1. 상단 헤더 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t("practice1.badge")}
            </span>
            <h1 className="text-xl font-bold text-slate-100">{t("practice1.title")}</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {t("practice1.desc")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts(page)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title={t("common.refresh")}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => openWriteModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("practice1.newPost")}
          </button>
        </div>
      </div>

      {/* 2. 게시글 목록 테이블/카드 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {t("practice1.pageInfo", { total: totalCount, current: page + 1, totalPages: Math.max(1, totalPages) })}
          </span>
          <span className="text-xs text-slate-500 font-mono">Page {page + 1} of {Math.max(1, totalPages)}</span>
        </div>

        {loading && posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
            {t("common.loading")}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            {t("practice1.table.noPosts")}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => openDetailModal(post.id)}
                className="p-4 md:p-5 hover:bg-slate-800/40 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{post.id}
                    </span>
                    <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition text-base">
                      {post.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                  {(user === post.author || isAdmin) && (
                    <>
                      {user === post.author && (
                        <button
                          onClick={() => openWriteModal(post)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title={t("common.edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title={t("common.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openDetailModal(post.id)}
                    className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20 transition cursor-pointer ml-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t("practice1.table.comments")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. 페이징 네비게이션 바 */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => fetchPosts(page - 1)}
            disabled={page === 0 || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="text-xs text-slate-400">
            {totalPages === 0 ? "1 / 1" : `${page + 1} / ${totalPages}`}
          </span>
          <button
            onClick={() => fetchPosts(page + 1)}
            disabled={page + 1 >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. 게시글 작성/수정 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingPost ? t("practice1.modal.editTitle") : t("practice1.modal.writeTitle")}
              </h3>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t("practice1.modal.titleLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t("practice1.modal.titlePlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t("practice1.modal.contentLabel")}
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={t("practice1.modal.contentPlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  {isSubmitting
                    ? t("practice1.modal.submitting")
                    : editingPost
                    ? t("practice1.modal.updateBtn")
                    : t("practice1.modal.createBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 게시글 상세 및 댓글 */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* 상단 헤더 */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between">
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    #{selectedPostDetail.post.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-100">
                    {selectedPostDetail.post.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {selectedPostDetail.post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedPostDetail.post.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 본문 & 댓글 영역 (스크롤) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* 본문 */}
              <div className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {selectedPostDetail.post.content}
              </div>

              {/* 댓글 영역 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  {t("practice1.detail.commentsTitle")} <span className="text-blue-400">({selectedPostDetail.comments.length})</span>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-2">
                  {selectedPostDetail.comments.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      {t("practice1.detail.noComments")}
                    </div>
                  ) : (
                    selectedPostDetail.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300">{comment.content}</p>
                        </div>
                        {(user === comment.author || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title={t("common.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 댓글 입력 폼 */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={t("practice1.detail.commentPlaceholder")}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    {t("practice1.detail.commentSubmit")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
