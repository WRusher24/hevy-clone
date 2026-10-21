import { DeleteIcon, LinkIcon, StarIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { absoluteUrl, copyToClipboard } from "../lib/clipboard";
import {
  formatDuration,
  formatVolume,
  initials,
  setSummary,
  timeAgo,
} from "../lib/format";
import { summarizeWorkout } from "../lib/stats";
import { FeedPost } from "../Types";
import ConfirmDialog from "./ConfirmDialog";

export default function FeedWorkoutCard({ post }: { post: FeedPost }) {
  const { getWorkout, toggleLike, addComment, deletePost, profile } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();

  const workout = getWorkout(post.workoutId);
  const summary = workout ? summarizeWorkout(workout) : null;
  const isMine = post.handle === profile.handle;

  const handleCopy = async () => {
    const ok = await copyToClipboard(absoluteUrl(`/workout/${post.workoutId}`));
    toast({
      title: ok ? "Link copied" : "Could not copy link",
      status: ok ? "success" : "error",
      duration: 1800,
      isClosable: true,
    });
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment("");
    setShowComments(true);
  };

  return (
    <article className="card">
      <div className="feed-card-head">
        <div className="avatar-initials">{initials(post.author)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="strong truncate" style={{ fontSize: 14 }}>
            {post.author}
          </div>
          <div className="small muted truncate">
            @{post.handle} · {timeAgo(post.createdAt)}
          </div>
        </div>

        <Menu placement="bottom-end">
          <MenuButton as={Button} size="xs" variant="ghost" aria-label="Post options">
            ···
          </MenuButton>
          <MenuList fontSize="sm">
            <MenuItem icon={<LinkIcon />} onClick={handleCopy}>
              Copy link
            </MenuItem>
            {isMine ? (
              <MenuItem icon={<DeleteIcon />} color="red.300" onClick={() => setConfirmDelete(true)}>
                Delete post
              </MenuItem>
            ) : null}
          </MenuList>
        </Menu>
      </div>

      <div className="feed-body">
        <div>
          <Link to={`/workout/${post.workoutId}`} className="feed-title">
            {post.title}
          </Link>
          {post.description ? (
            <Text className="small muted" mt={1}>
              {post.description}
            </Text>
          ) : null}
        </div>

        {summary && workout ? (
          <>
            <div className="feed-metrics">
              <div className="metric-box">
                <div className="metric-label">Duration</div>
                <div className="metric-value">{formatDuration(summary.durationMs)}</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">Volume</div>
                <div className="metric-value">{formatVolume(summary.volume, workout.unit)}</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">Sets</div>
                <div className="metric-value">{summary.sets}</div>
              </div>
            </div>

            <div>
              {workout.exercises.slice(0, 4).map((exercise) => (
                <div className="feed-exercise-line" key={exercise.id}>
                  <span className="truncate">{exercise.name}</span>
                  <span className="muted small mono" style={{ whiteSpace: "nowrap" }}>
                    {setSummary(exercise.sets, workout.unit)}
                  </span>
                </div>
              ))}
              {workout.exercises.length > 4 ? (
                <div className="small muted" style={{ paddingTop: 6 }}>
                  +{workout.exercises.length - 4} more exercise
                  {workout.exercises.length - 4 === 1 ? "" : "s"}
                </div>
              ) : null}
              {workout.exercises.length === 0 ? (
                <div className="small muted">No exercises logged.</div>
              ) : null}
            </div>
          </>
        ) : (
          <Text className="small muted">This workout is no longer available.</Text>
        )}
      </div>

      <div className="feed-actions">
        <Button
          size="xs"
          variant="ghost"
          leftIcon={<StarIcon boxSize="12px" />}
          color={post.likedByMe ? "yellow.300" : "gray.400"}
          onClick={() => toggleLike(post.id)}
        >
          {post.likes}
        </Button>

        <Button
          size="xs"
          variant="ghost"
          color="gray.400"
          onClick={() => setShowComments((value) => !value)}
        >
          {post.comments.length} comment{post.comments.length === 1 ? "" : "s"}
        </Button>

        <span style={{ flex: 1 }} />

        <Button size="xs" variant="ghost" leftIcon={<LinkIcon boxSize="11px" />} onClick={handleCopy}>
          Share
        </Button>
        <Button
          as={Link}
          to={`/workout/${post.workoutId}`}
          size="xs"
          variant="ghost"
          color="gray.400"
        >
          View
        </Button>
      </div>

      {showComments ? (
        <div className="comment-box">
          {post.comments.map((item) => (
            <div className="comment-row" key={item.id}>
              <div className="avatar-initials sm">{initials(item.author)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="small">
                  <span className="strong">{item.author}</span>{" "}
                  <span className="muted">· {timeAgo(item.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13 }}>{item.content}</div>
              </div>
            </div>
          ))}

          {post.comments.length === 0 ? (
            <div className="small muted" style={{ padding: "4px 0 8px" }}>
              No comments yet. Be the first to cheer them on.
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Input
              size="sm"
              placeholder="Add a comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleComment();
              }}
            />
            <Button size="sm" onClick={handleComment} isDisabled={!comment.trim()}>
              Post
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete this post?"
        body="The post and its comments will be removed from your feed. The workout stays in your history."
        confirmLabel="Delete"
        danger
        onConfirm={() => deletePost(post.id)}
        onClose={() => setConfirmDelete(false)}
      />
    </article>
  );
}
