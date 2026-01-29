// Test OCR script - run with: node test-ocr.mjs
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const testImagePath = './test-images/veso_test.png';

console.log('🔍 Testing OCR on lottery ticket...\n');

if (!fs.existsSync(testImagePath)) {
    console.log('❌ Test image not found:', testImagePath);
    process.exit(1);
}

console.log('📷 Image found:', testImagePath);
console.log('⏳ Processing with Tesseract.js...\n');

try {
    const result = await Tesseract.recognize(testImagePath, 'vie+eng', {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                process.stdout.write(`\r   Progress: ${Math.round(m.progress * 100)}%`);
            }
        },
    });

    console.log('\n\n✅ OCR Complete!\n');
    console.log('📝 Raw text detected:');
    console.log('─'.repeat(50));
    console.log(result.data.text);
    console.log('─'.repeat(50));

    // Extract numbers
    const text = result.data.text
        .replace(/[oO]/g, '0')
        .replace(/[lI|]/g, '1')
        .replace(/[zZ]/g, '2')
        .replace(/[sS$]/g, '5')
        .replace(/[bB]/g, '8');

    const numbers = text.match(/\b\d{2,6}\b/g) || [];
    const uniqueNumbers = [...new Set(numbers)];

    console.log('\n🔢 Numbers detected:', uniqueNumbers.length);
    uniqueNumbers.forEach((num, i) => {
        console.log(`   ${i + 1}. ${num}`);
    });

    // Check for date
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
        console.log('\n📅 Date detected:', dateMatch[0]);
    }

    // Check for province
    const provincePatterns = {
        'TP.HCM': /tp\.?hcm|h[ồô]\s*ch[íi]\s*minh/i,
        'Đồng Nai': /[đd][ồo]ng\s*nai/i,
        'Bình Dương': /b[ìi]nh\s*d[ươ][oơ]ng/i,
    };

    for (const [name, pattern] of Object.entries(provincePatterns)) {
        if (pattern.test(result.data.text)) {
            console.log('🏛️  Province detected:', name);
            break;
        }
    }

    console.log('\n📊 Confidence:', Math.round(result.data.confidence) + '%');

} catch (error) {
    console.error('❌ Error:', error.message);
}
