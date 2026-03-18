export const publishToFacebook = async (content: string, mediaItems: any[], token: string) => {
  try {
    if (!token || !token.startsWith('EAA')) {
      throw new Error("Token Facebook không hợp lệ.")
    }

    const accountsResponse = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`)
    const accountsData = await accountsResponse.json()

    if (accountsData.error) {
      throw new Error(accountsData.error.message || 'Không thể lấy thông tin trang Facebook.')
    }

    const pages = accountsData.data || []
    if (pages.length === 0) {
      throw new Error('Tài khoản của bạn không quản lý Trang (Page) nào.')
    }

    const targetPage = pages[0]
    const pageId = targetPage.id
    const pageToken = targetPage.access_token
    const pageName = targetPage.name

    const attached_media: { media_fbid: string }[] = []

    if (mediaItems && mediaItems.length > 0) {
      for (const item of mediaItems) {
        try {
          const blobResponse = await fetch(item.url)
          if (!blobResponse.ok) continue
          const blob = await blobResponse.blob()

          const mediaForm = new FormData()
          mediaForm.append('source', blob, item.name || 'filename')
          mediaForm.append('published', 'false')
          mediaForm.append('access_token', pageToken)

          let endpoint = `https://graph.facebook.com/v21.0/${pageId}/photos`
          if (item.type === 'video') {
             endpoint = `https://graph.facebook.com/v21.0/${pageId}/videos`
          }

          const uploadResponse = await fetch(endpoint, {
             method: 'POST',
             body: mediaForm
          })
          const uploadData = await uploadResponse.json()
          if (uploadData.id) {
             attached_media.push({ media_fbid: uploadData.id })
          }
        } catch (err) {
          console.error(`Không thể tải lên phương tiện ${item.name}:`, err)
        }
      }
    }

    const postBody: any = {
      message: content,
      access_token: pageToken
    }

    if (attached_media.length > 0) {
      postBody.attached_media = attached_media
    }

    const publishResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody)
    })

    const publishData = await publishResponse.json()

    if (publishData.id) {
      const requestedLink = `https://www.facebook.com/duchu.craft`
      return {
        success: true,
        link: requestedLink,
        pageName
      }
    } else {
      throw new Error(publishData.error?.message || 'Có lỗi xảy ra từ Facebook API.')
    }
  } catch (error: any) {
    console.error("Facebook API Error:", error)
    return { success: false, error: error.message }
  }
}

export const publishToInstagram = async (content: string, mediaItems: any[], token: string) => {
  try {
    if (!token || !token.startsWith('EAA')) {
      throw new Error("Token Instagram không hợp lệ.")
    }

    // Step 1: Lấy IG User ID thông qua endpoints Facebook Pages
    const accountsResponse = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${token}`)
    const accountsData = await accountsResponse.json()

    if (accountsData.error) {
       throw new Error(accountsData.error.message || 'Không thể lấy thông tin Instagram.')
    }

    const pages = accountsData.data || []
    const igPage = pages.find((p: any) => p.instagram_business_account)

    if (!igPage) {
       throw new Error('Tài khoản Facebook của bạn không quản lý Trang nào có liên kết Instagram Business.')
    }

    const igUserId = igPage.instagram_business_account.id
    const pageToken = igPage.access_token

    if (mediaItems.length === 0) {
       throw new Error('Đăng bài Instagram bắt buộc phải có ít nhất 1 hình ảnh hoặc video.')
    }

    const firstItem = mediaItems[0]
    // Instagram yêu cầu URL công khai
    if (firstItem.url.startsWith('blob:') || firstItem.url.startsWith('http://localhost')) {
       throw new Error('Instagram Graph API yêu cầu URL công khai cho phương tiện. Blob cục bộ / Ảnh AI hiện chưa hỗ trợ đẩy qua FE trực tiếp (Cần một Backend làm Proxy upload).')
    }

    // Step 2: Tạo Photo/Video Container
    const createResponse = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: firstItem.url,
        caption: content,
        access_token: pageToken
      })
    })

    const createData = await createResponse.json()
    if (!createData.id) {
       throw new Error(createData.error?.message || 'Không thể khởi tạo Container cho Instagram.')
    }

    const creationId = createData.id
    await new Promise(resolve => setTimeout(resolve, 2000)) // Đợi hệ thống xử lý

    // Step 3: Publish Container
    const publishResponse = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({
          creation_id: creationId,
          access_token: pageToken
       })
    })

    const publishData = await publishResponse.json()

    if (publishData.id) {
       return { success: true, link: `https://www.instagram.com/duchu.craft/` }
    } else {
       throw new Error(publishData.error?.message || 'Lỗi khi phát hành bài viết lên Instagram.')
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export const publishToThreads = async (content: string, mediaItems: any[], token: string) => {
  try {
    if (!token || token.trim().length < 10) {
       throw new Error("Threads: Yêu cầu Threads User Access Token để tạo bài. Đăng bài API từ Web yêu cầu cấu hình token thật.")
    }

    const firstMedia = mediaItems[0]
    let mediaType = "TEXT"
    let imageUrl = ""
    
    if (firstMedia && firstMedia.type === 'image') {
       mediaType = "IMAGE"
       if (firstMedia.url.startsWith('blob:') || firstMedia.url.startsWith('http://localhost')) {
          throw new Error('Đăng ảnh trên Threads yêu cầu URL công khai. Blob cục bộ / Ảnh AI hiện chưa hỗ trợ đẩy qua FE trực tiếp (Cần một Backend).')
       }
       imageUrl = firstMedia.url
    }

    // Bước 1: Khởi tạo container bài đăng
    const createParams: any = {
       media_type: mediaType,
       text: content,
       access_token: token
    }
    if (mediaType === "IMAGE") {
       createParams.image_url = imageUrl
    }

    const createResponse = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams(createParams)
    })

    const createData = await createResponse.json()
    if (!createData.id) {
       throw new Error(createData.error?.message || 'Không thể tạo container bài đăng trên Threads.')
    }

    const creationId = createData.id
    await new Promise(resolve => setTimeout(resolve, 2000)) // Đợi xử lý

    // Bước 2: Phát hành bài đăng
    const publishResponse = await fetch(`https://graph.threads.net/v1.0/me/threads_publish`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({
          creation_id: creationId,
          access_token: token
       })
    })

    const publishData = await publishResponse.json()

    if (publishData.id) {
       return { success: true, link: `https://www.threads.net/@duchu.craft` }
    } else {
       throw new Error(publishData.error?.message || 'Lỗi khi phát hành bài viết lên Threads.')
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const checkTokenValidity = (token: string) => {
  return token && token.length > 33 && token.startsWith('EAA')
}
