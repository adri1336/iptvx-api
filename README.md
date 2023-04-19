# IPTVX API
A simple real Time FFmpeg conversor for IPTVX
Plays .avi and DivX in browser

## Install
1. Clone this repository or download it
2. Install dependencies using `npm install`
3. `node index.js`

## Endpoints
| Name | Description | Params | Example |
| ------------- | -------------  | ------------- | ------------- |
| metadata | Return video metadata info | url | http://localhost:3042/metadata?url=http://mysite.com/video.avi |
| convert | Stream video converting it to MP4 | url, seekTo | http://localhost:3042/convert?url=http://mysite.com/video.avi&seekTo=1200 |

## Testing
```html
<video width="800" height="600" controls>
  <source src="http://localhost:3042/convert?url=http://mysite.com/video.avi">
  Video not supported.
</video>
```
