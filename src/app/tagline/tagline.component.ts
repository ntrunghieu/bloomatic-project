import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Quote = { text: string; author?: string };

@Component({
  selector: 'app-tagline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tagline.component.html',
  styleUrls: ['./tagline.component.css']
})
export class TaglineComponent {
  // curated inspirational taglines — add or edit as you like
  quotes: Quote[] = [
    { text: 'Đủ nắng hoa sẽ nở, Bloom đủ làm bạn say đắm chưa?', author: 'Bloomatic gửi bạn' },
    { text: 'Đến rạp, quên thời gian — tìm lại những khoảnh khắc.', author: 'Bloomatic gửi bạn' },
    { text: 'Cảm xúc lớn lao bắt đầu từ một tấm vé nhỏ.', author: 'Bloomatic gửi bạn' },
    { text: 'Một câu chuyện hay có thể thay đổi cả ngày của bạn.', author: 'Bloom gửi bạn' },
    { text: 'Đủ nắng hoa sẽ nở, Bloom đủ làm bạn say đắm chưa?', author: 'Bloomatic gửi bạn' },
    { text: 'Chạm vào trái tim bằng những thước phim tuyệt vời.', author: 'Bloomatic gửi bạn' },
    { text: 'Hãy xem, cảm nhận, và chia sẻ — đó là phép màu của rạp chiếu.', author: 'Bloomatic gửi bạn' }
  ];

  // deterministically choose one quote per day (based on date)
  get dailyQuote(): Quote {
    const now = new Date();
    // use month*31 + day to vary across months too
    const index = ((now.getMonth() * 31) + now.getDate() - 1) % this.quotes.length;
    return this.quotes[index];
  }
}
