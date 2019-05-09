#import "NativeUpdater.h"

@implementation NativeUpdater

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(closeApp)
{
    exit(0);
}

RCT_EXPORT_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary* infoDict = [[NSBundle mainBundle] infoDictionary];
    NSString* version = [infoDict objectForKey:@"CFBundleShortVersionString"];
    resolve(version);
}

@end
