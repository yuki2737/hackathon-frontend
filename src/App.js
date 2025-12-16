import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // ← 追加

import Home from "./pages/Home";
import Search from "./pages/Search";
import Ranking from "./pages/Ranking";
import MyPage from "./pages/MyPage";
import ProductDetail from "./pages/ProductDetail";
import OrderHistory from "./pages/OrderHistory";
import Login from "./pages/Login";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import Tabs from "./components/Tabs";
import PurchaseComplete from "./pages/PurchaseComplete";
import ProductPreview from "./pages/ProductPreview";
import FloatingSellButton from "./components/FloatingSellButton";
import Threads from "./pages/Threads";
import ThreadDetail from "./pages/ThreadDetail";

function App() {
  return (
    <>
      <Header /> {/* ← 全ページ共通で表示されるヘッダー */}
      <Tabs />
      <div style={{ marginTop: "120px", marginBottom: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/purchase-complete" element={<PurchaseComplete />} />
          <Route path="/products/:id/preview" element={<ProductPreview />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/threads/:threadId" element={<ThreadDetail />} />
        </Routes>
      </div>
      <FloatingSellButton />
    </>
  );
}

export default App;
