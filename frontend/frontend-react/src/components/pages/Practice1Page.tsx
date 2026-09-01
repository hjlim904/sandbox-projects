import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {FileText, Plus, MessageSquare, Trash2, Edit3, Calendar, User, ChevronLeft, ChevronRight, Send, X, RefreshCw, Clock} from "lucide-react";

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

export default function Practice1Page() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = useCallback(async (targetPage: number = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8082/api/posts?page=${targetPage}&size=5`);
      if (res.ok) {
        const data: PageResponse<Post> = await res.json();
        setPosts(data.items);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("게시글 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // 게시글 조회 (댓글)
  const openDetailModal = async (postId: number) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`http://localhost:8082/api/posts/${postId}`);
      if (res.ok) {
        const data: PostDetail = await res.json();
        setSelectedPostDetail(data);
      }
    } catch (err) {
      console.error("게시글 상세 조회 실패:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // 게시글 작성 또는 수정
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const isEdit = !!editingPost;
      const url = isEdit
        ? `http://localhost:8082/api/posts/${editingPost.id}`
        : "http://localhost:8082/api/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: formTitle, content: formContent }),
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
        const err = await res.text();
        alert(`저장 실패: ${err}`);
      }
    } catch (err) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?") || !token) return;

    try {
      const res = await fetch(`http://localhost:8082/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (selectedPostDetail?.post.id === postId) {
          setSelectedPostDetail(null);
        }
        fetchPosts(page);
      } else {
        alert("삭제 권한이 없거나 실패했습니다.");
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 댓글 작성
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPostDetail || !token) return;

    try {
      const res = await fetch(
        `http://localhost:8082/api/posts/${selectedPostDetail.post.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: commentInput }),
        }
      );

      if (res.ok) {
        setCommentInput("");
        openDetailModal(selectedPostDetail.post.id);
      } else {
        alert("댓글 작성 실패");
      }
    } catch (err) {
      alert("댓글 작성 중 오류 발생");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPostDetail || !token || !confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(
        `http://localhost:8082/api/posts/${selectedPostDetail.post.id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        openDetailModal(selectedPostDetail.post.id);
      }
    } catch (err) {
      alert("댓글 삭제 중 오류 발생");
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
              실습 1
            </span>
            <h1 className="text-xl font-bold text-slate-100">R2DBC 비동기 게시판 & 댓글 시스템</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Spring Data R2DBC + WebFlux 기반 완전 비동기 논블로킹 CRUD 및 1:N 실시간 댓글 처리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts(page)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => openWriteModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            새 글 작성
          </button>
        </div>
      </div>

      {/* 2. 게시글 목록 테이블/카드 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            총 <span className="text-blue-400 font-bold">{totalCount}</span>개의 게시글
          </span>
          <span className="text-xs text-slate-500 font-mono">Page {page + 1} of {Math.max(1, totalPages)}</span>
        </div>

        {loading && posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
            게시글을 불러오는 중...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            등록된 게시글이 없습니다. 첫 번째 글을 작성해보세요!
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
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
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
            이전
          </button>
          <span className="text-xs text-slate-400">
            {totalPages === 0 ? "1 / 1" : `${page + 1} / ${totalPages}`}
          </span>
          <button
            onClick={() => fetchPosts(page + 1)}
            disabled={page + 1 >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-700 transition cursor-pointer"
          >
            다음
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. 글 작성 / 수정 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingPost ? "게시글 수정" : "새 게시글 작성"}
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
                  제목
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  내용
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  {isSubmitting ? "저장 중..." : editingPost ? "수정 완료" : "작성 완료"}
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
                  댓글 <span className="text-blue-400">({selectedPostDetail.comments.length})</span>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-2">
                  {selectedPostDetail.comments.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      아직 작성된 댓글이 없습니다.
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
                            title="댓글 삭제"
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
                    placeholder="따뜻한 댓글을 남겨보세요..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    등록
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
