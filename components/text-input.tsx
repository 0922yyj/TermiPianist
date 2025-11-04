import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

const TextInput = ({
  onSend,
  disabled = false,
  placeholder = `请输入任务`,
  className,
  maxLength = 200,
}: {
  onSend: (value: string, type?: "text" | "voice", time?: string) => void;
  disabled: boolean;
  placeholder: string;
  className?: string;
  maxLength: number;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  // 输入框聚焦状态
  const [isFocused, setIsFocused] = useState(false);
  // 文字输入限制
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  // 键盘回车发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 输入框聚焦事件
  const handleFocus = () => {
    setIsFocused(true);
  };

  // 输入框失焦事件
  const handleBlur = () => {
    setIsFocused(false);
  };

  // 发送消息
  const handleSend = useCallback(() => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  }, [text, onSend]);
  return (
    <div
      className={cn(
        "rounded-[16px] relative border-[1.5px] border-gray-300",
        className
      )}
    >
      <div className="flex flex-col w-full h-[112px] rounded-[16px] relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          maxLength={maxLength}
          className={cn(
            "w-full h-[110px] placeholder:text-gray-400 placeholder:text-[14px] flex-1 text-[14px]",
            "bg-transparent text-gray-900 border-none focus:outline-none",
            "resize-none pl-4 pr-2 pt-4 rounded-[16px]",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        />
        <div className="absolute bottom-4 right-4 flex items-center">
          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className={cn(
              "w-[24px] h-[24px] flex items-center justify-center rounded transition-colors bg-[#3C89E8] hover:bg-[#3C89E8]/90 text-white",
              (disabled || !text.trim()) && "cursor-not-allowed opacity-50"
            )}
            aria-label="发送消息"
            tabIndex={0}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
