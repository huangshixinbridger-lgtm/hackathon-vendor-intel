// app/classic/page.tsx —— 经典视图入口已合并到动线第一步「找游戏 · 情报雷达」。
// 总览页内容（搜索 + 推荐资讯）现在在 /radar 顶部呈现；这里重定向过去，保留旧入口可达。
import { redirect } from "next/navigation";

export default function ClassicPage() {
  redirect("/radar");
}
