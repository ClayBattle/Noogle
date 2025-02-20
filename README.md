# Noogle
An extension that creates a new Google Doc and places it within my internal doc structure within 1 minute. Meant to be loaded as a dev extension. 

Spawned out of the need for 1. better google drive document organization and 2. frantic "oh no, I don't have a blank note document for recording meeting notes" 1 minute before the meeting starts.


## Extension Setup (Edge)
1. Clone the repo to a new directory
2. Head to the Google Cloud Console
3. Select Noogle as the active project, then head to the APIs & services page (https://console.cloud.google.com/apis/credentials?project=noogle-448219)
4. Click Credentials
5. Download the EdgeExtension(WebAPP) credential
6. Rename the credential to credentials.json
7. Move the credentials to the Noogle directory
8. Click on the puzzle piece in Edge (extensions page)
10. Under installed extensions, click 'load unpacked'
11. Select this (Noogle) directory
12. Nice


## Attribution
Icon - https://www.rawpixel.com/image/6479591/png-sticker-book


## Todo-list where to resume:
1. Handle cached token expiration
2. Moving auth code into its own file?
3. Placing file in its own directory option...

### other:
2. looking into how templates work