export default function Typing() {
    return (
      <div className="flex rounded-lg p-4 justify center w-20 bg-gray-100 items-center space-x-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
    )
  }