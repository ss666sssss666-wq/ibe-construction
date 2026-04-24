with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

trust_start = content.find('<!-- Trust / Logo Cloud Section (Before Contact) -->')
trust_end = content.find('</section>', trust_start) + len('</section>')

reviews_start = content.find('<!-- Client Reviews Section -->')
reviews_end = content.find('</section>', reviews_start) + len('</section>')

trust_section = content[trust_start:trust_end]
reviews_section = content[reviews_start:reviews_end]

# Modify reviews section header
reviews_section = reviews_section.replace('<span class="vision-badge">TÉMOIGNAGES</span>', '''<div class="trust-header" style="margin-bottom: 20px;">
          <div class="trust-line"></div>
          <h2 class="trust-title" data-i18n="reviews_header_title" style="letter-spacing: 2px;">TÉMOIGNAGES</h2>
          <div class="trust-line"></div>
        </div>''')

# Add leave review button
reviews_section = reviews_section.replace('</div>\n\n        <div class="review-cards-stack"', '''  <div style="margin-top: 25px;">
            <a href="#contact" class="cta-btn primary" data-i18n="leave_review">Laisser un avis</a>
          </div>
        </div>\n\n        <div class="review-cards-stack"''')

# Swap them
new_content = content[:trust_start] + reviews_section + '\n\n    ' + trust_section + content[reviews_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
